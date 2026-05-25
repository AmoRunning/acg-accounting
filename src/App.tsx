import { useState, useEffect, useCallback } from 'react';
import { Layout, Toast, Tabs, TabPane } from '@douyinfe/semi-ui';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';
import CategoryPage from './pages/CategoryPage';
import RecordModal from './components/RecordModal';
import TrashModal from './components/TrashModal';
import {
  openDB, getAllRecords, getAllTrash, saveAllRecords, saveAllTrash,
  getAllCategories, putCategory, deleteCategory, DEFAULT_CATEGORIES,
  getAllFieldConfigs, putFieldConfig, deleteFieldConfig, getDefaultFieldConfigsForCategory,
} from './utils/db';
import { blobToBase64, base64ToBlob } from './utils/image';
import type { GuRecord, TrashRecord, Category, FieldConfig } from './types';
import './App.css';

const PAGE_SIZE = 9;

export default function App() {
  const [records, setRecords] = useState<GuRecord[]>([]);
  const [trash, setTrash] = useState<TrashRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GuRecord | null>(null);
  const [trashVisible, setTrashVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    (async () => {
      await openDB();
      const recs = await getAllRecords();
      const trashItems = await getAllTrash();
      let cats = await getAllCategories();
      if (cats.length === 0) {
        for (const c of DEFAULT_CATEGORIES) {
          await putCategory(c);
        }
        cats = [...DEFAULT_CATEGORIES];
      }
      let fcs = await getAllFieldConfigs();
      if (fcs.length === 0) {
        for (const cat of cats) {
          const defaults = getDefaultFieldConfigsForCategory(cat.id);
          for (const fc of defaults) {
            await putFieldConfig(fc);
          }
          fcs = [...fcs, ...defaults];
        }
      }
      setRecords(recs);
      setTrash(trashItems);
      setCategories(cats);
      setFieldConfigs(fcs);
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (newRecords: GuRecord[], newTrash: TrashRecord[]) => {
    await saveAllRecords(newRecords);
    await saveAllTrash(newTrash);
  }, []);

  const filteredRecords = records.filter((r) => {
    const kw = search.toLowerCase();
    const matchSearch = !kw || r.name.toLowerCase().includes(kw)
      || (r.owner || '').toLowerCase().includes(kw)
      || (r.series || '').toLowerCase().includes(kw);
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchCategory = !categoryFilter || r.category === categoryFilter;
    let matchPayment = true;
    if (paymentFilter === '待付均摊') matchPayment = !r.isAveragePaid;
    else if (paymentFilter === '待付大货') matchPayment = !r.isBigGoodsPaid;
    else if (paymentFilter === '已结清') matchPayment = r.isAveragePaid && r.isBigGoodsPaid;
    return matchSearch && matchStatus && matchCategory && matchPayment;
  });

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const pageRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAdd = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: GuRecord) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleSave = async (data: Partial<GuRecord>) => {
    let newRecords: GuRecord[];
    if (editingRecord) {
      newRecords = records.map((r) => (r.id === editingRecord.id ? { ...r, ...data, updatedAt: Date.now() } : r));
    } else {
      newRecords = [...records, { ...data, id: Date.now(), createdAt: Date.now(), updatedAt: Date.now() } as GuRecord];
    }
    setRecords(newRecords);
    await persist(newRecords, trash);
    setModalVisible(false);
    Toast.success(editingRecord ? '已更新' : '已添加');
  };

  const handleDelete = async (id: number) => {
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const item: TrashRecord = { ...records[idx], deletedAt: Date.now() };
    const newRecords = records.filter((r) => r.id !== id);
    const newTrash = [...trash, item];
    setRecords(newRecords);
    setTrash(newTrash);
    await persist(newRecords, newTrash);
    Toast.success('已移至回收站');
  };

  const handleCopy = async (id: number) => {
    const orig = records.find((r) => r.id === id);
    if (!orig) return;
    const newRec: GuRecord = { ...orig, id: Date.now(), name: orig.name + ' - 副本', updatedAt: Date.now() };
    if (orig.image instanceof Blob) newRec.image = orig.image.slice();
    const idx = records.findIndex((r) => r.id === id);
    const newRecords = [...records];
    newRecords.splice(idx + 1, 0, newRec);
    setRecords(newRecords);
    await persist(newRecords, trash);
    Toast.success('已复制');
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const offset = (currentPage - 1) * PAGE_SIZE;
    const realFrom = offset + fromIndex;
    const realTo = offset + toIndex;
    if (realFrom === realTo) return;
    const newRecords = [...records];
    const [item] = newRecords.splice(realFrom, 1);
    newRecords.splice(realTo, 0, item);
    setRecords(newRecords);
    await persist(newRecords, trash);
  };

  const handleToggleAvgPaid = async (id: number) => {
    const newRecords = records.map((r) =>
      r.id === id ? { ...r, isAveragePaid: !r.isAveragePaid, updatedAt: Date.now() } : r
    );
    setRecords(newRecords);
    await persist(newRecords, trash);
  };

  const handleToggleBigPaid = async (id: number) => {
    const newRecords = records.map((r) =>
      r.id === id ? { ...r, isBigGoodsPaid: !r.isBigGoodsPaid, updatedAt: Date.now() } : r
    );
    setRecords(newRecords);
    await persist(newRecords, trash);
  };

  const handleRestore = async (id: number) => {
    const item = trash.find((t) => t.id === id);
    if (!item) return;
    const { deletedAt, ...restored } = item;
    const newTrash = trash.filter((t) => t.id !== id);
    const newRecords = [...records, restored as GuRecord];
    setRecords(newRecords);
    setTrash(newTrash);
    await persist(newRecords, newTrash);
    Toast.success('已恢复');
  };

  const handlePermDelete = async (id: number) => {
    const newTrash = trash.filter((t) => t.id !== id);
    setTrash(newTrash);
    await saveAllTrash(newTrash);
  };

  const handleEmptyTrash = async () => {
    setTrash([]);
    await saveAllTrash([]);
    Toast.success('回收站已清空');
  };

  const handleExport = async () => {
    const data: any[] = [];
    for (const r of records) {
      const exp: any = { ...r };
      if (r.image instanceof Blob) exp.image = await blobToBase64(r.image);
      else exp.image = null;
      data.push(exp);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.download = `chigu_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
    Toast.success('导出成功');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('格式错误');
      const newRecords: GuRecord[] = [];
      for (const r of data) {
        const rec: any = { ...r };
        if (r.image && typeof r.image === 'string' && r.image.startsWith('data:')) {
          rec.image = await base64ToBlob(r.image);
        } else {
          rec.image = null;
        }
        if (!rec.updatedAt) rec.updatedAt = Date.now();
        newRecords.push(rec);
      }
      setRecords(newRecords);
      setTrash([]);
      await persist(newRecords, []);
      Toast.success(`导入成功，共${newRecords.length}条`);
    } catch (e: any) {
      Toast.error('导入失败：' + e.message);
    }
  };

  const handleImageUpload = async (id: number, blob: Blob) => {
    const newRecords = records.map((r) =>
      r.id === id ? { ...r, image: blob, updatedAt: Date.now() } : r
    );
    setRecords(newRecords);
    await persist(newRecords, trash);
  };

  const handleImageDelete = async (id: number) => {
    const newRecords = records.map((r) =>
      r.id === id ? { ...r, image: null, updatedAt: Date.now() } : r
    );
    setRecords(newRecords);
    await persist(newRecords, trash);
  };

  const handleAddCategory = async (name: string) => {
    const newCat: Category = { id: `cat_${Date.now()}`, name, isDefault: false };
    await putCategory(newCat);
    const newConfigs = getDefaultFieldConfigsForCategory(newCat.id);
    for (const fc of newConfigs) {
      await putFieldConfig(fc);
    }
    setCategories([...categories, newCat]);
    setFieldConfigs([...fieldConfigs, ...newConfigs]);
    Toast.success(`已添加分类「${name}」`);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    const relatedConfigs = fieldConfigs.filter((fc) => fc.categoryId === id);
    for (const fc of relatedConfigs) {
      await deleteFieldConfig(fc.id);
    }
    setCategories(categories.filter((c) => c.id !== id));
    setFieldConfigs(fieldConfigs.filter((fc) => fc.categoryId !== id));
    Toast.success('分类已删除');
  };

  const handleUpdateFieldConfig = async (config: FieldConfig) => {
    await putFieldConfig(config);
    setFieldConfigs(fieldConfigs.map((fc) => fc.id === config.id ? config : fc));
  };

  const handleAddFieldConfig = async (config: FieldConfig) => {
    await putFieldConfig(config);
    setFieldConfigs([...fieldConfigs, config]);
  };

  const handleDeleteFieldConfig = async (id: string) => {
    await deleteFieldConfig(id);
    setFieldConfigs(fieldConfigs.filter((fc) => fc.id !== id));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>加载中...</div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Layout.Content style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
        <div className="app-header">
          <h1 className="app-title">🐾 吃谷记录</h1>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 20 }}>
          <TabPane tab="📊 看板" itemKey="dashboard">
            <DashboardPage records={records} />
          </TabPane>

          <TabPane tab="📋 记录" itemKey="records">
            <RecordsPage
              pageRecords={pageRecords}
              currentPage={currentPage}
              totalPages={totalPages}
              total={filteredRecords.length}
              search={search}
              statusFilter={statusFilter}
              paymentFilter={paymentFilter}
              categoryFilter={categoryFilter}
              categories={categories}
              onSearchChange={setSearch}
              onStatusChange={setStatusFilter}
              onPaymentChange={setPaymentFilter}
              onCategoryChange={setCategoryFilter}
              onPageChange={setCurrentPage}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onReorder={handleReorder}
              onToggleAvgPaid={handleToggleAvgPaid}
              onToggleBigPaid={handleToggleBigPaid}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
              onExport={handleExport}
              onImport={handleImport}
              onTrash={() => setTrashVisible(true)}
            />
          </TabPane>

          <TabPane tab="📂 分类管理" itemKey="categories">
            <CategoryPage
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              fieldConfigs={fieldConfigs}
              onUpdateFieldConfig={handleUpdateFieldConfig}
              onAddFieldConfig={handleAddFieldConfig}
              onDeleteFieldConfig={handleDeleteFieldConfig}
            />
          </TabPane>
        </Tabs>

        <RecordModal
          visible={modalVisible}
          record={editingRecord}
          categories={categories}
          fieldConfigs={fieldConfigs}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
        />

        <TrashModal
          visible={trashVisible}
          trash={trash}
          onClose={() => setTrashVisible(false)}
          onRestore={handleRestore}
          onPermDelete={handlePermDelete}
          onEmpty={handleEmptyTrash}
        />
      </Layout.Content>
    </Layout>
  );
}
