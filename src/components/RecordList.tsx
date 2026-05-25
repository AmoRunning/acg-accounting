import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { Button, Tag, Pagination, Popconfirm, Space, Card, Switch, Descriptions, Avatar } from '@douyinfe/semi-ui';
import { IconEdit, IconCopy, IconDelete, IconImage } from '@douyinfe/semi-icons';
import { compressImage } from '../utils/image';
import type { GuRecord } from '../types';

interface RecordCardProps {
  record: GuRecord;
  index: number;
  dragIndex: number | null;
  overIndex: number | null;
  onEdit: (record: GuRecord) => void;
  onDelete: (id: number) => void;
  onCopy: (id: number) => void;
  onImageUpload: (id: number, blob: Blob) => void;
  onImageDelete: (id: number) => void;
  onToggleAvgPaid: (id: number) => void;
  onToggleBigPaid: (id: number) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
}

function RecordCard({
  record, index, dragIndex, overIndex,
  onEdit, onDelete, onCopy,
  onImageUpload, onImageDelete,
  onToggleAvgPaid, onToggleBigPaid,
  onDragStart, onDragEnter, onDragEnd,
}: RecordCardProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (record.image instanceof Blob) {
      const url = URL.createObjectURL(record.image);
      setImgUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImgUrl(null);
  }, [record.image]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = await compressImage(file);
    onImageUpload(record.id, blob);
    e.target.value = '';
  };

  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(index);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    onDragEnter(index);
  };

  const formatDT = (d: string | null) => (d ? d.replace('T', ' ') : '-');
  const payable = record.isAveragePaid
    ? (Number(record.unitPrice) || 0)
    : ((Number(record.unitPrice) || 0) + (Number(record.averageCost) || 0));

  const statusColors: Record<string, any> = {
    '打样中': 'blue',
    '大货中': 'orange',
    '发货中': 'cyan',
    '已到货': 'green',
  };

  const getPaymentTag = () => {
    if (record.isAveragePaid && record.isBigGoodsPaid) return { label: '已结清', color: 'green' };
    const pending: string[] = [];
    if (!record.isAveragePaid) pending.push('待付均摊');
    if (!record.isBigGoodsPaid) pending.push('待付大货');
    return { label: pending.join('+'), color: 'red' };
  };
  const paymentTag = getPaymentTag();

  const isDragging = dragIndex === index;
  const isOver = overIndex === index && dragIndex !== index;

  const descData = [
    { key: '工艺', value: record.craft || '-' },
    { key: '镀色', value: record.plating || '-' },
    { key: '车主', value: record.owner || '-' },
    { key: '数量', value: String(record.quantity || 1) },
    { key: '均摊', value: `¥${(record.averageCost || 0).toFixed(2)} / ${record.averageType || '个摊'}` },
    { key: '单价', value: `¥${(record.unitPrice || 0).toFixed(2)}` },
    { key: '单个总价', value: `¥${(record.bigGoodsAmount || payable).toFixed(2)}` },
    { key: '系列', value: record.series || '-' },
    { key: 'DDL', value: formatDT(record.ddlDate) },
    { key: '排期', value: formatDT(record.scheduleDate) },
  ];

  if (record.remark) {
    descData.push({ key: '备注', value: record.remark });
  }

  return (
    <div
      className={`record-card-wrapper ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragEnd={onDragEnd}
    >
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="drag-handle" title="拖拽排序">⠿</span>
            {imgUrl ? (
              <Avatar size="small" src={imgUrl} shape="square" onClick={() => setViewerSrc(imgUrl)} style={{ cursor: 'pointer' }} />
            ) : (
              <Avatar size="small" shape="square" style={{ background: 'var(--semi-color-fill-1)' }}>📷</Avatar>
            )}
            <span style={{ fontWeight: 600 }}>{record.name}</span>
          </div>
        }
        headerExtraContent={
          <Space>
            {record.category && <Tag color="cyan" size="small">{record.category}</Tag>}
            <Tag color={statusColors[record.status] || 'grey'} size="small">{record.status}</Tag>
            <Tag color={paymentTag.color as any} size="small">{paymentTag.label}</Tag>
          </Space>
        }
        style={{ width: '100%' }}
      >
        <Space wrap style={{ marginBottom: 12 }}>
          <Button size="small" icon={<IconEdit />} onClick={() => onEdit(record)}>编辑</Button>
          <Button size="small" icon={<IconCopy />} onClick={() => onCopy(record.id)}>复制</Button>
          <Button size="small" icon={<IconImage />} onClick={() => fileRef.current?.click()}>上传图</Button>
          {imgUrl && <Button size="small" type="danger" onClick={() => onImageDelete(record.id)}>删图</Button>}
          <Popconfirm title="确定删除?" onConfirm={() => onDelete(record.id)} position="top">
            <Button size="small" type="danger" icon={<IconDelete />}>删除</Button>
          </Popconfirm>
        </Space>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

        <Descriptions data={descData} row size="small" style={{ marginBottom: 12 }} />

        <Space style={{ marginTop: 4 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-2)' }}>均摊已付</span>
          <Switch size="small" checked={record.isAveragePaid} onChange={() => onToggleAvgPaid(record.id)} />
          <span style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-2)', marginLeft: 12 }}>大货已付</span>
          <Switch size="small" checked={record.isBigGoodsPaid} onChange={() => onToggleBigPaid(record.id)} />
        </Space>
      </Card>

      {viewerSrc && (
        <div className="image-viewer-overlay" onClick={() => setViewerSrc(null)}>
          <img src={viewerSrc} alt="preview" />
        </div>
      )}
    </div>
  );
}

interface Props {
  records: GuRecord[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (record: GuRecord) => void;
  onDelete: (id: number) => void;
  onCopy: (id: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleAvgPaid: (id: number) => void;
  onToggleBigPaid: (id: number) => void;
  onImageUpload: (id: number, blob: Blob) => void;
  onImageDelete: (id: number) => void;
}

export default function RecordList({
  records, currentPage, totalPages, total,
  onPageChange, onEdit, onDelete, onCopy,
  onReorder, onToggleAvgPaid, onToggleBigPaid,
  onImageUpload, onImageDelete,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragEnter = (index: number) => setOverIndex(index);
  const handleDragEnd = () => {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      onReorder(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  if (records.length === 0) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--semi-color-text-2)' }}>暂无数据，点击「+谷子」开始记录~</div>;
  }

  return (
    <>
      <div className="record-grid">
        {records.map((r, i) => (
          <RecordCard
            key={r.id}
            record={r}
            index={i}
            dragIndex={dragIndex}
            overIndex={overIndex}
            onEdit={onEdit}
            onDelete={onDelete}
            onCopy={onCopy}
            onImageUpload={onImageUpload}
            onImageDelete={onImageDelete}
            onToggleAvgPaid={onToggleAvgPaid}
            onToggleBigPaid={onToggleBigPaid}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <Pagination
            currentPage={currentPage}
            total={total}
            pageSize={9}
            onPageChange={onPageChange}
            showTotal
          />
        </div>
      )}
    </>
  );
}
