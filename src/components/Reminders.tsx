import { Card, Space, Tag } from '@douyinfe/semi-ui';
import type { GuRecord } from '../types';

interface Props {
  records: GuRecord[];
}

export default function Reminders({ records }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const ddlItems = records.filter((r) => r.ddlDate && r.ddlDate.startsWith(today));
  const scheduleItems = records.filter((r) => r.scheduleDate && r.scheduleDate.startsWith(today));

  return (
    <Space align="start" wrap style={{ marginBottom: 20, width: '100%' }}>
      <Card title="📆 今日DDL" style={{ minWidth: 260, flex: 1 }} bodyStyle={{ padding: '12px 16px' }}>
        {ddlItems.length === 0 ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-2)' }}>暂无</span>
        ) : (
          ddlItems.map((r) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed var(--semi-color-border)' }}>
              <span style={{ fontSize: '0.8rem' }}>📌 {r.name}{r.owner ? ` (${r.owner})` : ''}</span>
              <Tag size="small" color="orange">{(r.ddlDate!.split('T')[1] || '').slice(0, 5)}</Tag>
            </div>
          ))
        )}
      </Card>
      <Card title="🗓️ 今日排期" style={{ minWidth: 260, flex: 1 }} bodyStyle={{ padding: '12px 16px' }}>
        {scheduleItems.length === 0 ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-2)' }}>暂无</span>
        ) : (
          scheduleItems.map((r) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed var(--semi-color-border)' }}>
              <span style={{ fontSize: '0.8rem' }}>🗓️ {r.name}{r.owner ? ` (${r.owner})` : ''}</span>
              <Tag size="small" color="blue">{(r.scheduleDate!.split('T')[1] || '').slice(0, 5)}</Tag>
            </div>
          ))
        )}
      </Card>
    </Space>
  );
}
