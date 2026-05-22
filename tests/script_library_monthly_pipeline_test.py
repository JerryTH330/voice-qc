import importlib.util
import pathlib
import unittest


MODULE_PATH = (
    pathlib.Path(__file__).resolve().parents[1]
    / 'script-library'
    / 'script-library-monthly-pipeline.py'
)


spec = importlib.util.spec_from_file_location('script_library_monthly_pipeline', MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ScriptLibraryMonthlyPipelineTest(unittest.TestCase):
    def test_expand_advantages_flattens_success_case_rows(self):
        rows = [
            {
                'call_id': 'call-001',
                'source_month': '2026-05',
                'success_result': '到店成功',
                'raw_asr': 'should not survive normalization',
                '优势发掘[]': [
                    {
                        '标签编码': 'T09',
                        '亮点类型': '到店邀约推进',
                        '判定置信度': 0.96,
                        '亮点级别': 'A',
                        '关联原文': '周末活动力度比较大，建议您到店看车。',
                        '可复制点': '用限时活动推进客户尽快到店。',
                    }
                ],
            }
        ]

        normalized = module.expand_advantages(module.filter_success_invites(rows))

        self.assertEqual(len(normalized), 1)
        self.assertEqual(normalized[0]['call_id'], 'call-001')
        self.assertEqual(normalized[0]['tag_code'], 'T09')
        self.assertEqual(normalized[0]['replicable_point'], '用限时活动推进客户尽快到店。')

    def test_build_monthly_llm_input_sets_month_scene_and_omits_raw_asr(self):
        normalized = [
            {
                'call_id': 'call-001',
                'source_month': '2026-05',
                'success_result': '到店成功',
                'tag_code': 'T09',
                'tag_name': '到店邀约推进',
                'confidence': 0.96,
                'level': 'A',
                'quote': '周末活动力度比较大，建议您到店看车。',
                'replicable_point': '用限时活动推进客户尽快到店。',
                'raw_asr': 'should not be forwarded',
            }
        ]

        llm_input = module.build_monthly_llm_input('2026-05', 'invite', normalized)

        self.assertEqual(llm_input['month'], '2026-05')
        self.assertEqual(llm_input['scene'], 'invite')
        self.assertEqual(llm_input['success_cases'][0]['source_month'], '2026-05')
        self.assertNotIn('raw_asr', llm_input['success_cases'][0])

    def test_build_monthly_package_preserves_overview_top_tags_for_selected_scene(self):
        monthly_output = {
            'overview': {'top_tags': [{'tag_code': 'T09', 'count': 3}]},
            'topics': [{'topic_id': 'invite-topic-1'}],
        }

        package = module.build_monthly_package('2026-05', 'invite', monthly_output)

        self.assertEqual(package['invite']['overview']['top_tags'], [{'tag_code': 'T09', 'count': 3}])
        self.assertEqual(package['invite']['topics'], [{'topic_id': 'invite-topic-1'}])
        self.assertEqual(package['reception'], {'overview': {'top_tags': []}, 'topics': []})
        self.assertEqual(package['test_drive'], {'overview': {'top_tags': []}, 'topics': []})

    def test_build_monthly_package_raises_for_unknown_scene(self):
        with self.assertRaises(ValueError):
            module.build_monthly_package('2026-05', 'delivery', {'topics': []})

    def test_merge_global_pool_updates_existing_scene_topic_by_identity(self):
        current_pool = {
            'invite': {'overview': {'top_tags': []}, 'topics': []},
            'reception': {
                'overview': {'top_tags': []},
                'topics': [
                    {
                        'topic_id': 'reception-topic-1',
                        'title': '进店接待破冰',
                        'source_months': ['2026-04'],
                        'first_seen_month': '2026-04',
                        'last_seen_month': '2026-04',
                        'recent_3m_count': 1,
                        'representative_samples': ['sample-a'],
                        'status': 'active',
                    }
                ],
            },
            'test_drive': {'overview': {'top_tags': []}, 'topics': []},
        }
        monthly_package = {
            'month': '2026-05',
            'scene': 'reception',
            'invite': {'overview': {'top_tags': []}, 'topics': []},
            'reception': {
                'overview': {'top_tags': []},
                'topics': [
                    {
                        'topic_id': 'reception-topic-1',
                        'title': '进店接待破冰',
                        'representative_samples': ['sample-b'],
                    }
                ],
            },
            'test_drive': {'overview': {'top_tags': []}, 'topics': []},
        }

        merged = module.merge_global_pool(current_pool, monthly_package)
        updated = merged['reception']['topics'][0]

        self.assertEqual(updated['last_seen_month'], '2026-05')
        self.assertEqual(updated['source_months'], ['2026-04', '2026-05'])
        self.assertEqual(updated['recent_3m_count'], 2)
        self.assertEqual(updated['representative_samples'], ['sample-b'])
        self.assertEqual(merged['invite'], {'overview': {'top_tags': []}, 'topics': []})


if __name__ == '__main__':
    unittest.main()
