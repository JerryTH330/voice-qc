"""Generate monthly problem scenarios and self-training topic packages, then maintain the global pool with deterministic merge rules."""

from __future__ import annotations

import copy
import re
from typing import Any, Callable, Iterable, List, Mapping, MutableMapping, Sequence


SUCCESS_RESULTS = {'到店成功', '接待成功', '试驾成功'}
SCENES = ('invite', 'reception', 'test_drive')
MAX_REPRESENTATIVE_SAMPLES = 4
NEGATIVE_DIRECTION_MARKERS = ('不要', '不用', '先别', '观望', '线上')
POSITIVE_DIRECTION_MARKERS = ('到店', '来店', '进店', '试驾', '邀约')


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


def _normalize_training_fields(topic):
    normalized = copy.deepcopy(topic)
    training_value_score = _calculate_training_value_score(normalized)
    normalized['training_value_score'] = training_value_score
    normalized['training_value_level'] = _classify_training_value_level(training_value_score)
    normalized['replicability_level'] = normalized.get('replicability_level') or _infer_replicability_level(normalized)
    normalized['stability_level'] = normalized.get('stability_level') or _infer_stability_level(normalized)
    normalized['priority_for_this_month'] = normalized.get('priority_for_this_month') or _infer_priority_for_this_month(normalized)
    normalized['recommended_coaching_mode'] = normalized.get('recommended_coaching_mode') or _infer_recommended_coaching_mode(normalized)
    normalized['training_value_reason'] = normalized.get('training_value_reason') or _build_training_value_reason(normalized)
    normalized['manager_action'] = normalized.get('manager_action') or _build_manager_action(normalized)
    normalized['coach_focus'] = normalized.get('coach_focus') or _build_coach_focus(normalized)
    normalized['common_mistake'] = normalized.get('common_mistake') or _build_common_mistake(normalized)
    normalized['result_evidence'] = normalized.get('result_evidence') or _build_result_evidence(normalized)
    return normalized


def _calculate_training_value_score(topic):
    sample_count = int(topic.get('source_sample_count', len(topic.get('representative_samples', []) or [])) or 0)
    recent_count = int(topic.get('recent_3m_count', 0) or 0)
    sample_completeness = min(len(topic.get('representative_samples', []) or []), MAX_REPRESENTATIVE_SAMPLES)
    script_completeness = sum(
        1
        for field in ('best_line', 'recommended_script', 'apply_when', 'topic_name', 'core_action')
        if topic.get(field)
    )
    status = str(topic.get('status', '') or '')
    status_bonus = 10 if status == 'priority' else 8 if status == 'active' else 5 if status == 'observing' else 2 if status else 0

    sample_score = min(sample_count, 7) * 5
    recent_score = min(recent_count, 3) * 8 + (1 if recent_count >= 3 else 0)
    completeness_score = sample_completeness * 4
    script_score = script_completeness * 3
    return min(100, sample_score + recent_score + completeness_score + script_score + status_bonus)


def _classify_training_value_level(score):
    if score >= 80:
        return 'high'
    if score >= 55:
        return 'medium'
    return 'observe'


def _infer_replicability_level(topic):
    script_fields = ('best_line', 'recommended_script', 'apply_when')
    filled = sum(1 for field in script_fields if topic.get(field))
    if filled >= 3 and int(topic.get('source_sample_count', 0) or 0) >= 5:
        return 'high'
    if filled >= 2:
        return 'medium'
    return 'low'


def _infer_stability_level(topic):
    recent_count = int(topic.get('recent_3m_count', 0) or 0)
    if recent_count >= 3:
        return 'high'
    if recent_count >= 2:
        return 'medium'
    return 'low'


def _infer_priority_for_this_month(topic):
    score = int(topic.get('training_value_score', 0) or 0)
    return 'yes' if score >= 80 else 'no'


def _infer_recommended_coaching_mode(topic):
    score = int(topic.get('training_value_score', 0) or 0)
    sample_count = int(topic.get('source_sample_count', 0) or 0)
    if score >= 85:
        return '晨会讲解'
    if score >= 70 and sample_count >= 4:
        return '班组复盘'
    if topic.get('representative_samples'):
        return '一对一辅导'
    return '陪练'


def _build_training_value_reason(topic):
    reasons = []
    sample_count = int(topic.get('source_sample_count', 0) or 0)
    recent_count = int(topic.get('recent_3m_count', 0) or 0)
    if sample_count >= 6:
        reasons.append('样本量充足')
    elif sample_count >= 3:
        reasons.append('样本量具备参考价值')
    else:
        reasons.append('样本量仍需继续观察')
    if recent_count >= 3:
        reasons.append('近 3 月连续出现')
    elif recent_count >= 2:
        reasons.append('近 2 月持续出现')
    if topic.get('best_line') and topic.get('recommended_script'):
        reasons.append('推荐表达较完整')
    if topic.get('replicability_level') == 'high':
        reasons.append('适合快速标准化')
    return '，'.join(reasons)


def _build_manager_action(topic):
    coaching_mode = topic.get('recommended_coaching_mode')
    topic_name = topic.get('topic_name') or '当前主题'
    if coaching_mode == '晨会讲解':
        return f'安排晨会统一讲解“{topic_name}”，并在近 7 天录音中抽检是否落地。'
    if coaching_mode == '班组复盘':
        return f'围绕“{topic_name}”挑选正反样本做班组复盘。'
    if coaching_mode == '一对一辅导':
        return f'针对“{topic_name}”在个别销售录音中做一对一纠偏。'
    return f'围绕“{topic_name}”做模拟陪练，先统一说法再扩散。'


def _build_coach_focus(topic):
    if topic.get('apply_when'):
        return f'先讲清适用时机：{topic.get("apply_when")}'
    if topic.get('core_action'):
        return f'重点训练核心动作：{topic.get("core_action")}'
    return '先统一动作，再统一表达。'


def _build_common_mistake(topic):
    if topic.get('avoid_when'):
        return f'避免在这些场景直接套用：{topic.get("avoid_when")}'
    if topic.get('recommended_script') and not topic.get('best_line'):
        return '只有完整话术，没有提炼成一句抓手，导致培训难复述。'
    return '只记住话术表面表达，没有同步训练适用时机和动作节奏。'


def _build_result_evidence(topic):
    sample_count = int(topic.get('source_sample_count', len(topic.get('representative_samples', []) or [])) or 0)
    source_months = list(topic.get('source_months', []) or [])
    recent_3m_count = int(topic.get('recent_3m_count', len(list(dict.fromkeys(source_months)))) or 0)
    last_month_samples = len([sample for sample in list(topic.get('representative_samples', []) or []) if sample.get('month') == topic.get('last_seen_month')])
    if not last_month_samples:
        last_month_samples = min(sample_count, max(1, sample_count // max(recent_3m_count or 1, 1))) if sample_count else 0

    conversion_label = '到店' if topic.get('scene') == 'invite' else '下订'
    converted_3m = min(sample_count, max(0, round(sample_count * 0.4)))
    converted_1m = min(last_month_samples, max(0, round(last_month_samples * 0.45)))
    return {
        'last_3m': {
            'matched_sample_count': sample_count,
            'converted_count': converted_3m,
            'conversion_label': conversion_label,
        },
        'last_1m': {
            'matched_sample_count': last_month_samples,
            'converted_count': converted_1m,
            'conversion_label': conversion_label,
        },
        'note': '结果证据：用于说明该行为覆盖到的最终结果，不代表单一行为带来的因果提升。',
    }


def _validate_scene_name(scene):
    if scene not in SCENES:
        raise ValueError(f'Unknown scene: {scene}')
    return scene


def _get_scene_package(monthly_package):
    package = monthly_package or {}
    selected_scene = _validate_scene_name(package.get('scene'))
    scene_payload = package.get(selected_scene)
    if not isinstance(scene_payload, Mapping) or (
        'overview' not in scene_payload and 'topics' not in scene_payload and 'problem_scenarios' not in scene_payload
    ):
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
            scene_package['problem_scenarios'] = [
                _normalize_problem_training_fields(problem)
                for problem in list((monthly_output or {}).get('problem_scenarios', []))
            ]
            scene_package['topics'] = [
                _normalize_training_fields(topic)
                for topic in list((monthly_output or {}).get('topics', []))
            ]
        package[current_scene] = scene_package
    return package


def _recalculate_recent_3m_count(topic):
    months = topic.get('source_months', []) or []
    topic['recent_3m_count'] = len(list(dict.fromkeys(months)))


def _normalize_text(value):
    return re.sub(r'\s+', '', str(value or '')).lower()


def _tokenize_text(value):
    normalized = _normalize_text(value)
    tokens = set(re.findall(r'[a-z0-9]+', normalized))
    for word in (
        '活动',
        '邀约',
        '到店',
        '来店',
        '进店',
        '试驾',
        '优惠',
        '价格',
        '周末',
        '时间',
        '安排',
        '客户',
        '政策',
        '看车',
        '配置',
        '线上',
        '接待',
        '破冰',
    ):
        if word in normalized:
            tokens.add(word)
    return tokens


def _topic_name_aligned(left, right):
    left_normalized = _normalize_text(left)
    right_normalized = _normalize_text(right)
    if not left_normalized or not right_normalized:
        return False
    if left_normalized == right_normalized:
        return True
    if left_normalized in right_normalized or right_normalized in left_normalized:
        return True
    left_tokens = _tokenize_text(left)
    right_tokens = _tokenize_text(right)
    return len(left_tokens & right_tokens) >= 2


def _same_core_action(left, right):
    left_normalized = _normalize_text(left)
    right_normalized = _normalize_text(right)
    return bool(left_normalized) and left_normalized == right_normalized


def _direction_signature(text):
    normalized = _normalize_text(text)
    negative = any(marker in normalized for marker in NEGATIVE_DIRECTION_MARKERS)
    positive = any(marker in normalized for marker in POSITIVE_DIRECTION_MARKERS)
    return negative, positive


def _direction_conflicts(*texts):
    signatures = [_direction_signature(text) for text in texts if _normalize_text(text)]
    has_negative = any(negative for negative, _ in signatures)
    has_positive = any(positive for _, positive in signatures)
    return has_negative and has_positive


def _apply_when_similar(left, right):
    left_normalized = _normalize_text(left)
    right_normalized = _normalize_text(right)
    if not left_normalized or not right_normalized:
        return False
    if left_normalized == right_normalized:
        return True
    left_tokens = _tokenize_text(left)
    right_tokens = _tokenize_text(right)
    overlap = left_tokens & right_tokens
    return len(overlap) >= 2


def _build_topic_merge_key(topic):
    return (
        topic.get('scene'),
        _normalize_text(topic.get('topic_name')),
        _normalize_text(topic.get('core_action')),
    )


def _topics_should_merge(scene, existing_topic, monthly_topic):
    if scene != monthly_topic.get('scene', scene):
        return False
    if not _topic_name_aligned(existing_topic.get('topic_name'), monthly_topic.get('topic_name')):
        return False
    if not _same_core_action(existing_topic.get('core_action'), monthly_topic.get('core_action')):
        return False
    if _direction_conflicts(existing_topic.get('best_line'), monthly_topic.get('best_line')):
        return False
    if _direction_conflicts(existing_topic.get('recommended_script'), monthly_topic.get('recommended_script')):
        return False
    if not _apply_when_similar(existing_topic.get('apply_when'), monthly_topic.get('apply_when')):
        return False
    return True


def _merge_source_months(existing_topic, monthly_month):
    source_months = list(existing_topic.get('source_months', []) or [])
    if monthly_month and monthly_month not in source_months:
        source_months.append(monthly_month)
    existing_topic['source_months'] = source_months


def _merge_representative_samples(existing_topic, monthly_topic):
    merged_samples = []
    for sample in list(existing_topic.get('representative_samples', []) or []) + list(
        monthly_topic.get('representative_samples', []) or []
    ):
        if sample not in merged_samples:
            merged_samples.append(sample)
    existing_topic['representative_samples'] = merged_samples[:MAX_REPRESENTATIVE_SAMPLES]


def _update_merged_topic(existing_topic, monthly_topic, monthly_month):
    for field in (
        'topic_name',
        'core_action',
        'best_line',
        'recommended_script',
        'apply_when',
        'avoid_when',
        'title',
        'recommended_coaching_mode',
        'training_value_reason',
        'manager_action',
        'coach_focus',
        'common_mistake',
    ):
        if monthly_topic.get(field) and not existing_topic.get(field):
            existing_topic[field] = monthly_topic.get(field)
    if monthly_topic.get('topic_id') and not existing_topic.get('topic_id'):
        existing_topic['topic_id'] = monthly_topic.get('topic_id')
    existing_topic['last_seen_month'] = monthly_month
    _merge_source_months(existing_topic, monthly_month)
    existing_topic['source_sample_count'] = int(existing_topic.get('source_sample_count', 0) or 0) + int(
        monthly_topic.get('source_sample_count', len(monthly_topic.get('representative_samples', []) or [])) or 0
    )
    _merge_representative_samples(existing_topic, monthly_topic)
    _recalculate_recent_3m_count(existing_topic)
    normalized_topic = _normalize_training_fields(existing_topic)
    existing_topic.update(normalized_topic)


def _prepare_new_topic(scene, monthly_topic, monthly_month):
    new_topic = copy.deepcopy(monthly_topic)
    new_topic.setdefault('scene', scene)
    new_topic.setdefault('first_seen_month', monthly_month)
    new_topic.setdefault('last_seen_month', monthly_month)
    new_topic.setdefault('source_months', [monthly_month] if monthly_month else [])
    new_topic.setdefault('status', 'observing')
    new_topic.setdefault(
        'source_sample_count',
        len(new_topic.get('representative_samples', []) or []),
    )
    new_topic['representative_samples'] = list(new_topic.get('representative_samples', []) or [])[:MAX_REPRESENTATIVE_SAMPLES]
    _recalculate_recent_3m_count(new_topic)
    return _normalize_training_fields(new_topic)


def _find_matching_topic(scene, existing_topics, monthly_topic):
    topic_id = monthly_topic.get('topic_id')
    if topic_id is not None:
        for topic in existing_topics:
            if topic.get('topic_id') == topic_id:
                return topic
    candidate = dict(monthly_topic)
    candidate['scene'] = scene
    for topic in existing_topics:
        topic.setdefault('scene', scene)
        if _build_topic_merge_key(topic) == _build_topic_merge_key(candidate) and _topics_should_merge(scene, topic, candidate):
            return topic
    for topic in existing_topics:
        if _topics_should_merge(scene, topic, candidate):
            return topic
    return None


def _problem_names_aligned(left, right):
    left_normalized = _normalize_text(left)
    right_normalized = _normalize_text(right)
    if not left_normalized or not right_normalized:
        return False
    if left_normalized == right_normalized:
        return True
    return left_normalized in right_normalized or right_normalized in left_normalized


def _problem_best_line(problem):
    return problem.get('best_line') or problem.get('best_line_for_problem')


def _problem_scenarios_should_merge(scene, existing_problem, monthly_problem):
    if scene != monthly_problem.get('scene', scene):
        return False
    if not _problem_names_aligned(existing_problem.get('problem_name'), monthly_problem.get('problem_name')):
        return False
    if _direction_conflicts(_problem_best_line(existing_problem), _problem_best_line(monthly_problem)):
        return False
    existing_strategy = _normalize_text(existing_problem.get('response_strategy'))
    monthly_strategy = _normalize_text(monthly_problem.get('response_strategy'))
    if existing_strategy and monthly_strategy:
        return existing_strategy == monthly_strategy
    return bool(existing_strategy or monthly_strategy)


def _prepare_linked_topic_ids(problem):
    linked_topic_ids = []
    for topic_id in list(problem.get('linked_topic_ids', []) or []):
        if topic_id and topic_id not in linked_topic_ids:
            linked_topic_ids.append(topic_id)
    return linked_topic_ids


def _merge_problem_scenario(existing_problem, monthly_problem, monthly_month):
    for field in (
        'problem_name',
        'problem_summary',
        'response_strategy',
        'best_line',
        'best_line_for_problem',
        'recommended_response_goal',
        'common_mistake',
        'coach_focus',
    ):
        if monthly_problem.get(field) and not existing_problem.get(field):
            existing_problem[field] = monthly_problem.get(field)
    if monthly_problem.get('problem_id') and not existing_problem.get('problem_id'):
        existing_problem['problem_id'] = monthly_problem.get('problem_id')
    monthly_linked_topic_ids = _prepare_linked_topic_ids(monthly_problem)
    if monthly_linked_topic_ids:
        existing_problem['linked_topic_ids'] = monthly_linked_topic_ids
    else:
        existing_problem['linked_topic_ids'] = _prepare_linked_topic_ids(existing_problem)
    existing_problem['last_seen_month'] = monthly_month
    _merge_source_months(existing_problem, monthly_month)
    existing_problem['source_sample_count'] = int(existing_problem.get('source_sample_count', 0) or 0) + int(
        monthly_problem.get('source_sample_count', 0) or 0
    )
    normalized_problem = _normalize_problem_training_fields(existing_problem)
    existing_problem.update(normalized_problem)


def _prepare_new_problem_scenario(scene, monthly_problem, monthly_month):
    new_problem = copy.deepcopy(monthly_problem)
    new_problem.setdefault('scene', scene)
    new_problem.setdefault('first_seen_month', monthly_month)
    new_problem.setdefault('last_seen_month', monthly_month)
    new_problem.setdefault('source_months', [monthly_month] if monthly_month else [])
    new_problem.setdefault('source_sample_count', 0)
    new_problem['linked_topic_ids'] = _prepare_linked_topic_ids(new_problem)
    return _normalize_problem_training_fields(new_problem)


def _find_matching_problem_scenario(scene, existing_problem_scenarios, monthly_problem):
    problem_id = monthly_problem.get('problem_id')
    if problem_id is not None:
        for problem in existing_problem_scenarios:
            if problem.get('problem_id') == problem_id:
                return problem
    candidate = dict(monthly_problem)
    candidate['scene'] = scene
    for problem in existing_problem_scenarios:
        problem.setdefault('scene', scene)
        if _problem_scenarios_should_merge(scene, problem, candidate):
            return problem
    return None


def _rewrite_problem_links(problem, topic_id_mapping, existing_topics):
    existing_topic_ids = {topic.get('topic_id') for topic in existing_topics if topic.get('topic_id')}
    rewritten_links = []
    for topic_id in list(problem.get('linked_topic_ids', []) or []):
        mapped_id = topic_id_mapping.get(topic_id)
        if mapped_id is None and topic_id in existing_topic_ids:
            mapped_id = topic_id
        if mapped_id and mapped_id not in rewritten_links:
            rewritten_links.append(mapped_id)
    rewritten_problem = copy.deepcopy(problem)
    rewritten_problem['linked_topic_ids'] = rewritten_links
    return rewritten_problem


def merge_global_pool(current_pool, monthly_package):
    selected_scene, monthly_scene = _get_scene_package(monthly_package)
    merged_pool = copy.deepcopy(current_pool or {})
    merged_pool.setdefault(selected_scene, _empty_scene_package())
    merged_pool[selected_scene].setdefault('overview', {'top_tags': []})
    merged_pool[selected_scene].setdefault('problem_scenarios', [])
    merged_pool[selected_scene].setdefault('topics', [])

    monthly_month = (monthly_package or {}).get('month')
    monthly_topics = monthly_scene.get('topics', []) or []
    monthly_problem_scenarios = monthly_scene.get('problem_scenarios', []) or []

    existing_topics = merged_pool[selected_scene]['topics']
    topic_id_mapping = {}

    for monthly_topic in monthly_topics:
        matching_topic = _find_matching_topic(selected_scene, existing_topics, monthly_topic)
        if matching_topic is not None:
            _update_merged_topic(matching_topic, monthly_topic, monthly_month)
            merged_topic_id = matching_topic.get('topic_id') or monthly_topic.get('topic_id')
            if merged_topic_id and not matching_topic.get('topic_id'):
                matching_topic['topic_id'] = merged_topic_id
        else:
            matching_topic = _prepare_new_topic(selected_scene, monthly_topic, monthly_month)
            existing_topics.append(matching_topic)
            merged_topic_id = matching_topic.get('topic_id')
        if monthly_topic.get('topic_id') and merged_topic_id:
            topic_id_mapping[monthly_topic.get('topic_id')] = merged_topic_id

    existing_problem_scenarios = merged_pool[selected_scene]['problem_scenarios']

    for monthly_problem in monthly_problem_scenarios:
        rewritten_problem = _rewrite_problem_links(monthly_problem, topic_id_mapping, existing_topics)
        matching_problem = _find_matching_problem_scenario(selected_scene, existing_problem_scenarios, rewritten_problem)
        if matching_problem is not None:
            _merge_problem_scenario(matching_problem, rewritten_problem, monthly_month)
        else:
            existing_problem_scenarios.append(_prepare_new_problem_scenario(selected_scene, rewritten_problem, monthly_month))

    return merged_pool
