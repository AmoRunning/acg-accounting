import { Card, Space } from '@douyinfe/semi-ui';
import type { GuRecord } from '../types';

interface Props {
  records: GuRecord[];
}

export default function StatsCards({ records }: Props) {
  const sampling = records.filter((r) => r.status === '打样中').length;
  const bulk = records.filter((r) => r.status === '大货中').length;
  const shipping = records.filter((r) => r.status === '发货中').length;
  const arrived = records.filter((r) => r.status === '已到货').length;

  const pendingAvg = records.filter((r) => !r.isAveragePaid);
  const totalAvg = pendingAvg.reduce((s, r) => s + (Number(r.averageCost) || 0), 0);

  const pendingBig = records.filter((r) => !r.isBigGoodsPaid);
  const totalBig = pendingBig.reduce(
    (s, r) => s + (Number(r.bigGoodsAmount) || 0),
    0
  );

  const settled = records.filter((r) => r.isAveragePaid && r.isBigGoodsPaid).length;

  const statusItems = [
    { title: '🎨 打样中', value: String(sampling), sub: '谷子数量' },
    { title: '🏭 大货中', value: String(bulk), sub: '制作中' },
    { title: '🚚 发货中', value: String(shipping), sub: '运输中' },
    { title: '📦 已到货', value: String(arrived), sub: '已拥有' },
  ];

  const paymentItems = [
    { title: '💰 待付均摊', value: `¥${totalAvg.toFixed(0)}`, sub: `${pendingAvg.length} 笔待付` },
    { title: '💸 待付大货', value: `¥${totalBig.toFixed(0)}`, sub: `${pendingBig.length} 笔待付` },
    { title: '✅ 已结清', value: String(settled), sub: '均摊+大货已付' },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <Space wrap style={{ marginBottom: 12 }}>
        {statusItems.map((item) => (
          <Card key={item.title} style={{ minWidth: 130 }} bodyStyle={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-2)', marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{item.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--semi-color-text-3)', marginTop: 4 }}>{item.sub}</div>
          </Card>
        ))}
      </Space>
      <Space wrap>
        {paymentItems.map((item) => (
          <Card key={item.title} style={{ minWidth: 130 }} bodyStyle={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-2)', marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{item.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--semi-color-text-3)', marginTop: 4 }}>{item.sub}</div>
          </Card>
        ))}
      </Space>
    </div>
  );
}
