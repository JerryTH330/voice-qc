import copy
import json
from pathlib import Path
import runpy
import unittest


ROOT = Path(__file__).resolve().parents[1]
PIPELINE = runpy.run_path(str(ROOT / 'script-library/script-library-monthly-pipeline.py'))
SCENES = ('first_follow', 'invite_store', 'schedule_confirm', 'store_reception', 'test_drive')


def run_sample(month, scene):
    """Exercise every public pipeline stage with explicitly simulated model output."""
    rows = []
    for index in range(3):
        rows.append({
            'call_id': f'DEMO-{scene}-{month}-{index}',
            'source_month': month,
            'success_result': '到店成功' if scene in SCENES[:3] else '接待成功',
            '优势发掘[]': [{
                '标签编码': 'T09', '亮点类型': '确认下一步安排', '判定置信度': 95,
                '亮点级别': 'A', '关联原文': f'样例原句 {index}：我们先确认方便的时间。',
                '可复制点': '确认客户时间后安排下一步',
            }],
        })
    rows.append({'call_id': 'DEMO-unsuccessful', 'source_month': month, 'success_result': '未到店', '优势发掘[]': []})
    original_rows = copy.deepcopy(rows)
    loaded = PIPELINE['load_single_call_results'](rows)
    success = PIPELINE['filter_success_invites'](loaded)
    advantages = PIPELINE['expand_advantages'](success)
    llm_input = PIPELINE['build_monthly_llm_input'](month, scene, advantages)
    prompt = PIPELINE['build_monthly_prompt'](lambda value: json.dumps(value, ensure_ascii=False), llm_input)
    topic_id = f'DEMO-topic-{scene}-{month}'
    output = {
        'overview': {'top_tags': ['确认下一步安排']},
        'topics': [{
            'topic_id': topic_id, 'topic_name': '明确时间后确认下一步',
            'core_action': '确认时间后安排下一步', 'summary': '离线验证样例，不代表真实客户分析。',
            'best_line': '我们先确认方便的时间。', 'recommended_script': '确认方便时间，再约定下一步安排。',
            'apply_when': '客户已表达方便的时间', 'source_sample_count': len(success),
            'representative_samples': [
                {'call_id': item['call_id'], 'quote': item['quote'], 'month': month}
                for item in advantages
            ],
            'result_evidence': {'note': '样例仅验证数据链路；未提供成交结果，不生成转化数量。'},
        }],
        'problem_scenarios': [{
            'problem_id': f'DEMO-problem-{scene}-{month}', 'problem_name': '下一步时间未明确',
            'response_strategy': '先确认客户时间再给出下一步安排',
            'training_priority': '中', 'problem_frequency_level': '样例频次',
            'recommended_response_goal': '明确下一步安排', 'source_sample_count': len(success),
            'linked_topic_ids': [topic_id, topic_id],
        }],
    }

    def validate(value):
        if not isinstance(value, dict) or not isinstance(value.get('topics'), list) or not isinstance(value.get('problem_scenarios'), list):
            raise ValueError('月度输出必须包含主题和问题列表')
        call_ids = {item['call_id'] for item in llm_input['success_cases']}
        for topic in value['topics']:
            if not topic.get('topic_id') or not topic.get('topic_name'):
                raise ValueError('主题标识和名称必填')
            if any(sample['call_id'] not in call_ids for sample in topic['representative_samples']):
                raise ValueError('代表样本必须来自成功样本输入')

    original_output = copy.deepcopy(output)
    validated = PIPELINE['validate_monthly_output'](validate, output)
    package = PIPELINE['build_monthly_package'](month, scene, validated)
    if rows != original_rows or output != original_output:
        raise AssertionError('流水线修改了输入')
    return {'input_rows': rows, 'llm_input': llm_input, 'prompt': prompt, 'simulated_model_output': output, 'monthly_package': package}


class MonthlyPipelineTests(unittest.TestCase):
    def test_empty_package_keeps_five_independent_scene_structures(self):
        package = PIPELINE['build_monthly_package']('2026-11', 'invite_store', {})
        self.assertEqual([key for key in package if key not in ('month', 'scene')], list(SCENES))
        for scene in SCENES:
            self.assertEqual(package[scene], {'overview': {'top_tags': []}, 'problem_scenarios': [], 'topics': []})
        package['first_follow']['overview']['top_tags'].append('测试')
        self.assertEqual(package['invite_store']['overview']['top_tags'], [])

    def test_problem_fields_preserve_evidence_and_deduplicate_links(self):
        source = {'problem_id': 'p1', 'problem_name': '时间未确认', 'training_priority': '高',
                  'problem_frequency_level': '高频', 'recommended_response_goal': '确认时间',
                  'coach_focus': '先询问再确认', 'common_mistake': '泛泛结束',
                  'linked_topic_ids': ['t1', '', 't1', 't2'], 'evidence': {'call_id': 'DEMO-call'}}
        before = copy.deepcopy(source)
        result = PIPELINE['_prepare_new_problem_scenario']('invite_store', source, '2026-11')
        self.assertEqual(result['linked_topic_ids'], ['t1', 't2'])
        for key in ('training_priority', 'problem_frequency_level', 'recommended_response_goal', 'coach_focus', 'common_mistake', 'evidence'):
            self.assertEqual(result[key], source[key])
        result['evidence']['call_id'] = 'changed'
        self.assertEqual(source, before)
        missing = PIPELINE['_prepare_new_problem_scenario']('invite_store', {'problem_name': '未补充训练判断'}, '2026-11')
        self.assertEqual(missing['training_priority'], '观察')
        self.assertEqual(missing['problem_frequency_level'], '未提供')
        self.assertEqual(missing['linked_topic_ids'], [])

    def test_full_chain_handles_all_five_scenes_without_cross_contamination(self):
        pool = {}
        for scene in SCENES:
            sample = run_sample('2026-11', scene)
            package = sample['monthly_package']
            before = copy.deepcopy(package)
            self.assertEqual(len(sample['llm_input']['success_cases']), 3)
            self.assertNotIn('DEMO-unsuccessful', sample['prompt'])
            self.assertEqual(package[scene]['topics'][0]['scene'], scene)
            self.assertTrue(all(not package[other]['topics'] for other in SCENES if other != scene))
            prior = copy.deepcopy(pool)
            merged = PIPELINE['merge_global_pool'](pool, package)
            self.assertEqual(pool, prior)
            self.assertEqual(package, before)
            pool = merged
        self.assertEqual(set(pool), set(SCENES))
        for scene in SCENES:
            self.assertEqual(len(pool[scene]['topics']), 1)
            self.assertEqual(len(pool[scene]['problem_scenarios']), 1)
            topic = pool[scene]['topics'][0]
            self.assertEqual(topic['source_sample_count'], 3)
            self.assertEqual(pool[scene]['problem_scenarios'][0]['linked_topic_ids'], [topic['topic_id']])

    def test_cross_month_merge_reuses_pool_ids_and_rewrites_problem_links(self):
        first = run_sample('2026-10', 'invite_store')['monthly_package']
        second = run_sample('2026-11', 'invite_store')['monthly_package']
        original = copy.deepcopy((first, second))
        pool = PIPELINE['merge_global_pool']({}, first)
        merged = PIPELINE['merge_global_pool'](pool, second)['invite_store']
        self.assertEqual(len(merged['topics']), 1)
        self.assertEqual(len(merged['problem_scenarios']), 1)
        topic = merged['topics'][0]
        problem = merged['problem_scenarios'][0]
        self.assertEqual(topic['topic_id'], first['invite_store']['topics'][0]['topic_id'])
        self.assertEqual(topic['source_sample_count'], 6)
        self.assertEqual(problem['source_sample_count'], 6)
        self.assertEqual(topic['source_months'], ['2026-10', '2026-11'])
        self.assertEqual(topic['recent_3m_count'], 2)
        self.assertEqual(len(topic['representative_samples']), 4)
        self.assertEqual(problem['linked_topic_ids'], [topic['topic_id']])
        self.assertEqual((first, second), original)

    def test_conflicting_actions_remain_separate(self):
        first = run_sample('2026-10', 'invite_store')['monthly_package']
        second = run_sample('2026-11', 'invite_store')['monthly_package']
        second['invite_store']['topics'][0]['core_action'] = '仅发送资料'
        second['invite_store']['problem_scenarios'][0]['response_strategy'] = '先发资料再等待客户回复'
        pool = PIPELINE['merge_global_pool'](PIPELINE['merge_global_pool']({}, first), second)['invite_store']
        self.assertEqual(len(pool['topics']), 2)
        self.assertEqual(len(pool['problem_scenarios']), 2)
        self.assertEqual(pool['problem_scenarios'][1]['linked_topic_ids'], [second['invite_store']['topics'][0]['topic_id']])

    def test_replaying_a_monthly_package_is_idempotent(self):
        package = run_sample('2026-11', 'invite_store')['monthly_package']
        pool = PIPELINE['merge_global_pool']({}, package)
        self.assertEqual(PIPELINE['merge_global_pool'](pool, package), pool)
        changed = copy.deepcopy(package)
        changed['invite_store']['topics'][0]['source_sample_count'] += 1
        before = copy.deepcopy(pool)
        with self.assertRaisesRegex(ValueError, '重建'):
            PIPELINE['merge_global_pool'](pool, changed)
        self.assertEqual(pool, before)

    def test_missing_business_results_never_generate_conversion_counts(self):
        for scene in SCENES:
            package = PIPELINE['build_monthly_package']('2026-11', scene, {
                'topics': [{'topic_id': 'sparse', 'topic_name': '未提供转化结果', 'source_sample_count': 7}]
            })
            evidence = package[scene]['topics'][0]['result_evidence']
            self.assertEqual(evidence['last_3m']['matched_sample_count'], 7)
            self.assertIsNone(evidence['last_3m']['converted_count'])
            self.assertIsNone(evidence['last_1m']['matched_sample_count'])
            self.assertIsNone(evidence['last_1m']['converted_count'])

    def test_schema_rejection_and_unknown_scenes_stop_the_chain(self):
        def reject(_):
            raise ValueError('缺少主题列表')
        with self.assertRaisesRegex(ValueError, '缺少主题列表'):
            PIPELINE['validate_monthly_output'](reject, {})
        for invalid in ('invite', 'reception', 'unknown', None):
            with self.subTest(scene=invalid), self.assertRaises(ValueError):
                PIPELINE['build_monthly_package']('2026-11', invalid, {})
        with self.assertRaisesRegex(ValueError, 'payload'):
            PIPELINE['merge_global_pool']({}, {'month': '2026-11', 'scene': 'invite_store'})


if __name__ == '__main__':
    unittest.main()
