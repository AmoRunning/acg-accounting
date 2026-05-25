import { useRef } from 'react';
import { Input, Select, Button, Space, Card } from '@douyinfe/semi-ui';
import { IconSearch, IconPlus, IconDelete, IconUpload, IconDownload } from '@douyinfe/semi-icons';
import type { Category } from '../types';

const STATUS_OPTIONS = ['打样中', '大货中', '发货中', '已到货'];
const PAYMENT_OPTIONS = ['待付均摊', '待付大货', '已结清'];

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  paymentFilter: string;
  onPaymentChange: (v: string) => void;
  categoryFilter: string;
  onCategoryChange: (v: string) => void;
  categories: Category[];
  onAdd: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onTrash: () => void;
}

export default function Toolbar({
  search, onSearchChange,
  statusFilter, onStatusChange,
  paymentFilter, onPaymentChange,
  categoryFilter, onCategoryChange,
  categories,
  onAdd, onExport, onImport, onTrash,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Card bodyStyle={{ padding: '12px 16px' }} style={{ marginBottom: 20 }}>
      <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space wrap>
          <Input
            prefix={<IconSearch />}
            placeholder="搜索名称/车主/系列"
            value={search}
            onChange={onSearchChange}
            style={{ width: 200 }}
          />
          <Select
            placeholder="全部状态"
            value={statusFilter || undefined}
            onChange={(v) => onStatusChange((v as string) || '')}
            style={{ width: 120 }}
            showClear
          >
            {STATUS_OPTIONS.map((s) => (
              <Select.Option key={s} value={s}>{s}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="金额状态"
            value={paymentFilter || undefined}
            onChange={(v) => onPaymentChange((v as string) || '')}
            style={{ width: 120 }}
            showClear
          >
            {PAYMENT_OPTIONS.map((p) => (
              <Select.Option key={p} value={p}>{p}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="全部分类"
            value={categoryFilter || undefined}
            onChange={(v) => onCategoryChange((v as string) || '')}
            style={{ width: 120 }}
            showClear
          >
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>
            ))}
          </Select>
        </Space>
        <Space>
          <Button icon={<IconDelete />} onClick={onTrash}>回收站</Button>
          <Button icon={<IconDownload />} onClick={onExport}>导出</Button>
          <Button icon={<IconUpload />} onClick={() => fileRef.current?.click()}>导入</Button>
          <Button type="primary" icon={<IconPlus />} onClick={onAdd} theme="solid">+谷子</Button>
        </Space>
      </Space>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) onImport(e.target.files[0]);
          e.target.value = '';
        }}
      />
    </Card>
  );
}
