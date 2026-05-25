import Toolbar from '../components/Toolbar';
import RecordList from '../components/RecordList';
import type { GuRecord, Category } from '../types';

interface Props {
  pageRecords: GuRecord[];
  currentPage: number;
  totalPages: number;
  total: number;
  search: string;
  statusFilter: string;
  paymentFilter: string;
  categoryFilter: string;
  categories: Category[];
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPaymentChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onEdit: (record: GuRecord) => void;
  onDelete: (id: number) => void;
  onCopy: (id: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleAvgPaid: (id: number) => void;
  onToggleBigPaid: (id: number) => void;
  onImageUpload: (id: number, blob: Blob) => void;
  onImageDelete: (id: number) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onTrash: () => void;
}

export default function RecordsPage({
  pageRecords, currentPage, totalPages, total,
  search, statusFilter, paymentFilter, categoryFilter, categories,
  onSearchChange, onStatusChange, onPaymentChange, onCategoryChange, onPageChange,
  onAdd, onEdit, onDelete, onCopy,
  onReorder, onToggleAvgPaid, onToggleBigPaid,
  onImageUpload, onImageDelete,
  onExport, onImport, onTrash,
}: Props) {
  return (
    <>
      <Toolbar
        search={search}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
        paymentFilter={paymentFilter}
        onPaymentChange={onPaymentChange}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
        categories={categories}
        onAdd={onAdd}
        onExport={onExport}
        onImport={onImport}
        onTrash={onTrash}
      />

      <RecordList
        records={pageRecords}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        onPageChange={onPageChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopy={onCopy}
        onReorder={onReorder}
        onToggleAvgPaid={onToggleAvgPaid}
        onToggleBigPaid={onToggleBigPaid}
        onImageUpload={onImageUpload}
        onImageDelete={onImageDelete}
      />
    </>
  );
}
