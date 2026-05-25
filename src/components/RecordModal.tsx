import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Modal, Form, Button, Space, Checkbox } from '@douyinfe/semi-ui';
import { compressImage } from '../utils/image';
import type { Category, GuRecord, FieldConfig } from '../types';

const AVG_TYPE_OPTIONS = ['个摊', '人头', '免摊'];
const STATUS_OPTIONS = ['打样中', '大货中', '发货中', '已到货'];

interface Props {
  visible: boolean;
  record: GuRecord | null;
  categories: Category[];
  fieldConfigs: FieldConfig[];
  onClose: () => void;
  onSave: (data: Partial<GuRecord>) => void;
}

export default function RecordModal({ visible, record, categories = [], fieldConfigs = [], onClose, onSave }: Props) {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compress, setCompress] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const formApiRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && record) {
      if (record.image instanceof Blob) {
        setImageBlob(record.image);
        setImagePreview(URL.createObjectURL(record.image));
      } else {
        setImageBlob(null);
        setImagePreview(null);
      }
      setSelectedCategory(record.category || categories[0]?.name || '');
    } else {
      setImageBlob(null);
      setImagePreview(null);
      setSelectedCategory(categories[0]?.name || '');
    }
  }, [visible, record, categories]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = compress ? await compressImage(file) : file;
      setImageBlob(blob);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(blob));
    } catch {
      setImageBlob(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleSubmit = () => {
    formApiRef.current?.validate().then((values: any) => {
      const catObj = categories.find((c) => c.name === (values.category || selectedCategory));
      const configs = catObj ? fieldConfigs.filter((fc) => fc.categoryId === catObj.id) : [];
      const dynamicFields: Record<string, string> = {};
      for (const fc of configs) {
        dynamicFields[fc.key] = values[fc.key] || '';
      }
      onSave({
        name: values.name,
        category: values.category || '',
        craft: values.craft || '',
        plating: values.plating || '',
        ...dynamicFields,
        owner: values.owner || '',
        quantity: Number(values.quantity) || 1,
        unitPrice: Number(values.unitPrice) || 0,
        averageCost: Number(values.averageCost) || 0,
        averageType: values.averageType || '个摊',
        series: values.series || '',
        status: values.status || '打样中',
        bigGoodsAmount: Number(values.bigGoodsAmount) || 0,
        ddlDate: values.ddlDate || null,
        scheduleDate: values.scheduleDate || null,
        isAveragePaid: values.isAveragePaid || false,
        isBigGoodsPaid: values.isBigGoodsPaid || false,
        remark: values.remark || '',
        image: imageBlob,
      });
    });
  };

  const initValues = record
    ? {
        name: record.name,
        category: record.category || categories[0]?.name || '',
        craft: record.craft || '',
        plating: record.plating || '',
        owner: record.owner || '',
        quantity: record.quantity || 1,
        unitPrice: record.unitPrice || 0,
        averageCost: record.averageCost || 0,
        averageType: record.averageType || '个摊',
        series: record.series || '',
        status: record.status || '打样中',
        bigGoodsAmount: record.bigGoodsAmount || 0,
        ddlDate: record.ddlDate || '',
        scheduleDate: record.scheduleDate || '',
        isAveragePaid: record.isAveragePaid || false,
        isBigGoodsPaid: record.isBigGoodsPaid || false,
        remark: record.remark || '',
        ...(record as any),
      }
    : {
        category: categories[0]?.name || '',
        averageType: '个摊',
        status: '打样中',
        quantity: 1,
        unitPrice: 0,
        averageCost: 0,
        bigGoodsAmount: 0,
        isAveragePaid: false,
        isBigGoodsPaid: false,
      };

  return (
    <Modal
      title={record ? '✏️ 编辑谷子' : '✨ 新增谷子'}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width="min(560px, 92vw)"
      style={{ maxHeight: '85vh' }}
      bodyStyle={{ overflow: 'auto', maxHeight: '70vh' }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {imagePreview ? (
            <img src={imagePreview} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12 }} alt="" />
          ) : (
            <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>📷</div>
          )}
          <Space>
            <Button size="small" onClick={() => fileRef.current?.click()}>上传图片</Button>
            <Button size="small" onClick={() => { setImageBlob(null); setImagePreview(null); }}>清除</Button>
          </Space>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        <Checkbox checked={compress} onChange={(e) => setCompress(e.target.checked ?? false)}>
          压缩上传（推荐）
        </Checkbox>
      </div>

      <Form
        getFormApi={(api: any) => { formApiRef.current = api; }}
        initValues={initValues}
        labelPosition="left"
        labelWidth={80}
        key={record ? record.id : 'new'}
      >
        <Form.Input field="name" label="谷名/车名" rules={[{ required: true, message: '请输入名称' }]} />
        <Form.Select
          field="category"
          label="分类"
          style={{ width: '100%' }}
          onChange={(v) => setSelectedCategory(v as string)}
        >
          {categories.map((c) => <Form.Select.Option key={c.id} value={c.name}>{c.name}</Form.Select.Option>)}
        </Form.Select>
        {(() => {
          const catObj = categories.find((c) => c.name === selectedCategory);
          const configs = catObj ? fieldConfigs.filter((fc) => fc.categoryId === catObj.id) : [];
          return configs.map((fc) =>
            fc.widget === 'select' ? (
              <Form.Select key={fc.id} field={fc.key} label={fc.name} style={{ width: '100%' }}>
                {fc.options.map((opt) => <Form.Select.Option key={opt} value={opt}>{opt}</Form.Select.Option>)}
              </Form.Select>
            ) : (
              <Form.Input key={fc.id} field={fc.key} label={fc.name} />
            )
          );
        })()}
        <Form.Input field="owner" label="车主" />
        <Form.InputNumber field="quantity" label="数量" min={1} />
        <Form.InputNumber field="unitPrice" label="单价(¥)" min={0} precision={2} />
        <Form.InputNumber field="averageCost" label="均摊(¥)" min={0} precision={2} />
        <Form.Select field="averageType" label="均摊类型" style={{ width: '100%' }}>
          {AVG_TYPE_OPTIONS.map((t) => <Form.Select.Option key={t} value={t}>{t}</Form.Select.Option>)}
        </Form.Select>
        <Form.Input field="series" label="系列" placeholder="IP/作品系列" />
        <Form.Select field="status" label="状态" style={{ width: '100%' }}>
          {STATUS_OPTIONS.map((s) => <Form.Select.Option key={s} value={s}>{s}</Form.Select.Option>)}
        </Form.Select>
        <Form.InputNumber field="bigGoodsAmount" label="单个总价(¥)" min={0} precision={2} />
        <Form.DatePicker field="ddlDate" label="DDL" type="dateTime" style={{ width: '100%' }} />
        <Form.DatePicker field="scheduleDate" label="排期" type="dateTime" style={{ width: '100%' }} />
        <Form.Switch field="isAveragePaid" label="均摊已付" />
        <Form.Switch field="isBigGoodsPaid" label="大货已付" />
        <Form.TextArea field="remark" label="备注" rows={2} />
      </Form>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" theme="solid" onClick={handleSubmit}>保存</Button>
      </div>
    </Modal>
  );
}
