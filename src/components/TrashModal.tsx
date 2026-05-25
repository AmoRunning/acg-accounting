import { Modal, Button, Popconfirm, Empty } from '@douyinfe/semi-ui';
import type { TrashRecord } from '../types';

interface Props {
  visible: boolean;
  trash: TrashRecord[];
  onClose: () => void;
  onRestore: (id: number) => void;
  onPermDelete: (id: number) => void;
  onEmpty: () => void;
}

export default function TrashModal({ visible, trash, onClose, onRestore, onPermDelete, onEmpty }: Props) {
  return (
    <Modal
      title={`🗑️ 回收站 (${trash.length})`}
      visible={visible}
      onCancel={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {trash.length > 0 && (
            <Popconfirm title="确定清空回收站？" onConfirm={onEmpty} position="top">
              <Button type="danger" theme="solid">清空回收站</Button>
            </Popconfirm>
          )}
          <Button onClick={onClose}>关闭</Button>
        </div>
      }
      width="min(500px, 92vw)"
      bodyStyle={{ maxHeight: '60vh', overflow: 'auto' }}
    >
      {trash.length === 0 ? (
        <Empty description="回收站为空" />
      ) : (
        trash.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.owner || ''} · {item.status}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="small" onClick={() => onRestore(item.id)}>恢复</Button>
              <Popconfirm title="彻底删除？" onConfirm={() => onPermDelete(item.id)} position="top">
                <Button size="small" type="danger">删除</Button>
              </Popconfirm>
            </div>
          </div>
        ))
      )}
    </Modal>
  );
}
