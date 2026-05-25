import { useState, KeyboardEvent } from 'react';
import { Button, Input, Popconfirm, Toast, Tag, Empty, Card, List, Space, Select, Divider, Modal } from '@douyinfe/semi-ui';
import { IconPlus, IconDelete, IconEdit } from '@douyinfe/semi-icons';
import type { Category, FieldConfig, FieldWidgetType } from '../types';

interface Props {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  fieldConfigs: FieldConfig[];
  onUpdateFieldConfig: (config: FieldConfig) => void;
  onAddFieldConfig: (config: FieldConfig) => void;
  onDeleteFieldConfig: (id: string) => void;
}

export default function CategoryPage({
  categories, onAddCategory, onDeleteCategory,
  fieldConfigs, onUpdateFieldConfig, onAddFieldConfig, onDeleteFieldConfig,
}: Props) {
  const [newName, setNewName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [addFieldVisible, setAddFieldVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldWidget, setNewFieldWidget] = useState<FieldWidgetType>('input');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      Toast.warning('请输入分类名称');
      return;
    }
    if (categories.some((c) => c.name === name)) {
      Toast.warning('分类已存在');
      return;
    }
    onAddCategory(name);
    setNewName('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleAddField = () => {
    const name = newFieldName.trim();
    const key = newFieldKey.trim();
    if (!name || !key) {
      Toast.warning('请填写字段名称和字段 key');
      return;
    }
    const currentConfigs = fieldConfigs.filter((fc) => fc.categoryId === selectedCategoryId);
    if (currentConfigs.some((fc) => fc.key === key)) {
      Toast.warning('该分类下已存在相同 key 的字段');
      return;
    }
    const config: FieldConfig = {
      id: `field_${key}_${selectedCategoryId}_${Date.now()}`,
      name,
      key,
      widget: newFieldWidget,
      options: [],
      isDefault: false,
      categoryId: selectedCategoryId,
    };
    onAddFieldConfig(config);
    setNewFieldName('');
    setNewFieldKey('');
    setNewFieldWidget('input');
    setAddFieldVisible(false);
    Toast.success(`已添加字段「${name}」`);
  };

  const currentConfigs = fieldConfigs.filter((fc) => fc.categoryId === selectedCategoryId);

  return (
    <Space vertical align="start" style={{ width: '100%' }} spacing={20}>
      <Card title="📂 分类管理" style={{ width: '100%' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--semi-color-text-2)', marginBottom: 16 }}>
          管理谷子的分类，可自定义添加新分类。默认分类不可删除。
        </p>

        <Space style={{ marginBottom: 20 }}>
          <Input
            placeholder="输入新分类名称"
            value={newName}
            onChange={setNewName}
            onKeyDown={handleKeyDown}
            style={{ width: 200 }}
          />
          <Button type="primary" theme="solid" icon={<IconPlus />} onClick={handleAdd}>
            添加分类
          </Button>
        </Space>

        {categories.length === 0 ? (
          <Empty description="暂无分类" />
        ) : (
          <List
            dataSource={categories}
            renderItem={(cat: Category) => (
              <List.Item
                main={
                  <Space>
                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                    {cat.isDefault && <Tag size="small" color="blue">默认</Tag>}
                  </Space>
                }
                extra={
                  !cat.isDefault ? (
                    <Popconfirm title={`确定删除「${cat.name}」？`} onConfirm={() => onDeleteCategory(cat.id)} position="left">
                      <Button size="small" type="danger" icon={<IconDelete />}>删除</Button>
                    </Popconfirm>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--semi-color-text-2)' }}>不可删除</span>
                  )
                }
              />
            )}
          />
        )}
      </Card>

      <Card title="⚙️ 字段配置" style={{ width: '100%' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--semi-color-text-2)', marginBottom: 16 }}>
          为每个分类独立配置表单字段的组件类型及选项。
        </p>

        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--semi-color-text-2)', marginRight: 8 }}>选择分类：</span>
          <Select
            value={selectedCategoryId}
            onChange={(v) => setSelectedCategoryId(v as string)}
            style={{ width: 160 }}
          >
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            ))}
          </Select>
        </div>

        {currentConfigs.length === 0 ? (
          <Empty description="该分类暂无字段配置" style={{ marginBottom: 16 }} />
        ) : (
          currentConfigs.map((fc) => (
            <FieldConfigItem
              key={fc.id}
              config={fc}
              onUpdate={onUpdateFieldConfig}
              onDelete={onDeleteFieldConfig}
            />
          ))
        )}

        <Button
          icon={<IconPlus />}
          onClick={() => setAddFieldVisible(true)}
          style={{ marginTop: 8 }}
        >
          添加字段
        </Button>

        <Modal
          title="添加字段"
          visible={addFieldVisible}
          onCancel={() => setAddFieldVisible(false)}
          onOk={handleAddField}
          okText="添加"
          cancelText="取消"
          width="min(400px, 92vw)"
        >
          <Space vertical style={{ width: '100%' }} spacing={12}>
            <div>
              <div style={{ marginBottom: 4, fontSize: '0.85rem' }}>字段名称（显示用）</div>
              <Input
                placeholder="如：材质、尺寸"
                value={newFieldName}
                onChange={setNewFieldName}
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: '0.85rem' }}>字段 Key（存储标识，英文）</div>
              <Input
                placeholder="如：material、size"
                value={newFieldKey}
                onChange={setNewFieldKey}
              />
            </div>
            <div>
              <div style={{ marginBottom: 4, fontSize: '0.85rem' }}>组件类型</div>
              <Select
                value={newFieldWidget}
                onChange={(v) => setNewFieldWidget(v as FieldWidgetType)}
                style={{ width: '100%' }}
              >
                <Select.Option value="select">选择器</Select.Option>
                <Select.Option value="input">输入框</Select.Option>
              </Select>
            </div>
          </Space>
        </Modal>
      </Card>
    </Space>
  );
}

interface FieldConfigItemProps {
  config: FieldConfig;
  onUpdate: (c: FieldConfig) => void;
  onDelete: (id: string) => void;
}

function FieldConfigItem({ config, onUpdate, onDelete }: FieldConfigItemProps) {
  const [newOption, setNewOption] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(config.name);

  const handleWidgetChange = (widget: string) => {
    onUpdate({ ...config, widget: widget as FieldWidgetType });
  };

  const handleNameSave = () => {
    const name = nameValue.trim();
    if (!name) {
      Toast.warning('字段名称不能为空');
      setNameValue(config.name);
      setEditingName(false);
      return;
    }
    if (name !== config.name) {
      onUpdate({ ...config, name });
    }
    setEditingName(false);
  };

  const handleNameKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setNameValue(config.name);
      setEditingName(false);
    }
  };

  const handleAddOption = () => {
    const opt = newOption.trim();
    if (!opt) return;
    if (config.options.includes(opt)) {
      Toast.warning('选项已存在');
      return;
    }
    onUpdate({ ...config, options: [...config.options, opt] });
    setNewOption('');
  };

  const handleRemoveOption = (opt: string) => {
    onUpdate({ ...config, options: config.options.filter((o) => o !== opt) });
  };

  const handleOptionKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleAddOption();
  };

  return (
    <div style={{ marginBottom: 16, padding: 16, border: '1px solid var(--semi-color-border)', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Space>
          {editingName ? (
            <Input
              size="small"
              value={nameValue}
              onChange={setNameValue}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              style={{ width: 120 }}
              autoFocus
            />
          ) : (
            <span
              style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              onClick={() => setEditingName(true)}
              title="点击编辑名称"
            >
              {config.name}
              <IconEdit style={{ marginLeft: 4, fontSize: 12, color: 'var(--semi-color-text-3)' }} />
            </span>
          )}
          <Tag size="small" color="grey">key: {config.key}</Tag>
        </Space>
        <Popconfirm title={`确定删除字段「${config.name}」？`} onConfirm={() => onDelete(config.id)} position="left">
          <Button size="small" type="danger" icon={<IconDelete />} />
        </Popconfirm>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-2)', marginRight: 8 }}>组件类型：</span>
        <Select
          size="small"
          value={config.widget}
          onChange={(v) => handleWidgetChange(v as string)}
          style={{ width: 120 }}
        >
          <Select.Option value="select">选择器</Select.Option>
          <Select.Option value="input">输入框</Select.Option>
        </Select>
      </div>

      {config.widget === 'select' && (
        <>
          <Divider margin={12} />
          <div style={{ marginBottom: 8, fontSize: '0.8rem', color: 'var(--semi-color-text-2)' }}>选项列表：</div>

          <div style={{ marginBottom: 12, minHeight: 32 }}>
            {config.options.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--semi-color-text-3)' }}>暂无选项，请在下方添加</span>
            ) : (
              <Space wrap>
                {config.options.map((opt) => (
                  <Tag
                    key={opt}
                    size="large"
                    closable
                    onClose={() => handleRemoveOption(opt)}
                  >
                    {opt}
                  </Tag>
                ))}
              </Space>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Input
              size="small"
              placeholder="输入新选项名称"
              value={newOption}
              onChange={setNewOption}
              onKeyDown={handleOptionKeyDown}
              style={{ width: 180 }}
            />
            <Button size="small" icon={<IconPlus />} onClick={handleAddOption}>添加</Button>
          </div>
        </>
      )}
    </div>
  );
}
