"""Lightweight monthly pipeline helpers for script-library handoff work."""

from __future__ import annotations

import copy
from typing import Any, Callable, Iterable, List, Mapping, MutableMapping, Sequence


SUCCESS_RESULTS = {'到店成功', '接待成功', '试驾成功'}
SCENES = ('invite', 'reception', 'test_drive')


def load_single_call_results(rows):
    return list(rows or [])


def filter_success_invites(rows):
    return [row for row in (rows or []) if row.get('success_result') in SUCCESS_RESULTS]


def expand_advantages(rows):
    normalized_rows = []
    for row in rows or []:
        for advantage in row.get('优势发掘[]', []) or []:
            normalized_rows.append(
                {
                    'call_id': row.get('call_id'),
                    'source_month': row.get('source_month'),
                    'success_result': row.get('success_result'),
                    'tag_code': advantage.get('标签编码'),
                    'tag_name': advantage.get('亮点类型'),
                    'confidence': advantage.get('判定置信度'),
                    'level': advantage.get('亮点级别'),
                    'quote': advantage.get('关联原文'),
                    'replicable_point': advantage.get('可复制点'),
                }
            )
    return normalized_rows


def build_monthly_llm_input(month, scene, normalized_advantages):
    return {
        'month': month,
        'scene': scene,
        'success_cases': [
            {
                'call_id': item.get('call_id'),
                'source_month': item.get('source_month'),
                'success_result': item.get('success_result'),
                'tag_code': item.get('tag_code'),
                'tag_name': item.get('tag_name'),
                'confidence': item.get('confidence'),
                'level': item.get('level'),
                'quote': item.get('quote'),
                'replicable_point': item.get('replicable_point'),
            }
            for item in (normalized_advantages or [])
        ],
    }


def build_monthly_prompt(prompt_builder, llm_input):
    return prompt_builder(llm_input)


def validate_monthly_output(schema_validator, llm_output):
    schema_validator(llm_output)
    return llm_output


def _empty_scene_package():
    return {'overview': {'top_tags': []}, 'topics': []}


def _validate_scene_name(scene):
    if scene not in SCENES:
        raise ValueError(f'Unknown scene: {scene}')
    return scene


def _get_scene_package(monthly_package):
    package = monthly_package or {}
    selected_scene = _validate_scene_name(package.get('scene'))
    scene_payload = package.get(selected_scene)
    if not isinstance(scene_payload, Mapping) or ('overview' not in scene_payload and 'topics' not in scene_payload):
        raise ValueError(
            f'Monthly package must contain a payload for scene {selected_scene}: invite, reception, or test_drive'
        )
    return selected_scene, scene_payload


def build_monthly_package(month, scene, monthly_output):
    selected_scene = _validate_scene_name(scene)
    package = {'month': month, 'scene': selected_scene}
    for current_scene in SCENES:
        scene_package = _empty_scene_package()
        if current_scene == selected_scene:
            if isinstance(monthly_output, Mapping) and isinstance(monthly_output.get('overview'), Mapping):
                scene_package['overview'] = copy.deepcopy(monthly_output.get('overview'))
            scene_package['topics'] = list((monthly_output or {}).get('topics', []))
        package[current_scene] = scene_package
    return package


def _recalculate_recent_3m_count(topic):
    months = topic.get('source_months', []) or []
    topic['recent_3m_count'] = len(list(dict.fromkeys(months)))


def merge_global_pool(current_pool, monthly_package):
    selected_scene, monthly_scene = _get_scene_package(monthly_package)
    merged_pool = copy.deepcopy(current_pool or {})
    merged_pool.setdefault(selected_scene, _empty_scene_package())
    merged_pool[selected_scene].setdefault('overview', {'top_tags': []})
    merged_pool[selected_scene].setdefault('topics', [])

    monthly_month = (monthly_package or {}).get('month')
    monthly_topics = monthly_scene.get('topics', []) or []

    existing_topics = merged_pool[selected_scene]['topics']
    topic_index = {topic.get('topic_id'): topic for topic in existing_topics if topic.get('topic_id') is not None}

    for monthly_topic in monthly_topics:
        topic_id = monthly_topic.get('topic_id')
        if topic_id in topic_index:
            existing = topic_index[topic_id]
            existing.update(monthly_topic)
            existing['last_seen_month'] = monthly_month
            source_months = existing.get('source_months', []) or []
            if monthly_month not in source_months:
                source_months.append(monthly_month)
            existing['source_months'] = source_months
            existing['representative_samples'] = list(monthly_topic.get('representative_samples', []))
            _recalculate_recent_3m_count(existing)
        else:
            new_topic = copy.deepcopy(monthly_topic)
            new_topic.setdefault('first_seen_month', monthly_month)
            new_topic.setdefault('last_seen_month', monthly_month)
            new_topic.setdefault('source_months', [monthly_month] if monthly_month else [])
            new_topic.setdefault('status', 'observing')
            _recalculate_recent_3m_count(new_topic)
            existing_topics.append(new_topic)
            if topic_id is not None:
                topic_index[topic_id] = new_topic

    return merged_pool
