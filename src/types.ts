export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

export type FieldWidgetType = 'select' | 'input';

export interface FieldConfig {
  id: string;
  name: string;
  key: string;
  widget: FieldWidgetType;
  options: string[];
  isDefault: boolean;
  categoryId: string;
}

export interface GuRecord {
  id: number;
  name: string;
  category: string;
  craft: string;
  plating: string;
  owner: string;
  quantity: number;
  unitPrice: number;
  averageCost: number;
  averageType: string;
  series: string;
  status: string;
  bigGoodsAmount: number;
  ddlDate: string | null;
  scheduleDate: string | null;
  isAveragePaid: boolean;
  isBigGoodsPaid: boolean;
  remark: string;
  image: Blob | null;
  createdAt: number;
  updatedAt: number;
}

export interface TrashRecord extends GuRecord {
  deletedAt: number;
}
