import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Download, Edit, Trash2, Filter, FileText, Receipt, FileBarChart2, FileCheck } from "lucide-react";

interface Document {
  id: string;
  number: string;
  type: "invoice" | "quotation" | "bast" | "receipt";
  client: string;
  date: string;
  dueDate?: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft" | "completed";
}

const mockDocuments: Document[] = [
  {
    id: "1",
    number: "INV-2024-001",
    type: "invoice",
    client: "PT Maju Jaya",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    amount: 15000000,
    status: "paid"
  },
  {
    id: "2",
    number: "QUO-2024-001",
    type: "quotation",
    client: "CV Sukses Mandiri",
    date: "2024-01-14",
    dueDate: "2024-01-28",
    amount: 8500000,
    status: "pending"
  },
  {
    id: "3",
    number: "BAST-2024-001",
    type: "bast",
    client: "PT Teknologi Nusantara",
    date: "2024-01-13",
    amount: 12000000,
    status: "completed"
  },
  {
    id: "4",
    number: "REC-2024-001",
    type: "receipt",
    client: "PT Digital Solution",
    date: "2024-01-12",
    amount: 5000000,
    status: "paid"
  },
  {
    id: "5",
    number: "INV-2024-002",
    type: "invoice",
    client: "CV Berkah Sejahtera",
    date: "2024-01-10",
    dueDate: "2024-01-25",
    amount: 3500000,
    status: "overdue"
  }
];

const documentTypeLabels = {
  invoice: "Invoice",
  quotation: "Penawaran",
  bast: "BAST",
  receipt: "Kwitansi"
};

const documentTypeIcons = {
  invoice: Receipt,
  quotation: FileBarChart2,
  bast: FileCheck,
  receipt: FileText
};

const statusLabels = {
  paid: "Lunas",
  pending: "Pending",
  overdue: "Jatuh Tempo",
  draft: "Draft",
  completed: "Selesai"
};

const statusColors = {
  paid: "bg-success text-success-foreground",
  pending: "bg-warning text-warning-foreground",
  overdue: "bg-destructive text-destructive-foreground",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-success text-success-foreground"
};

export default function History() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || doc.type === selectedType;
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTotalAmount = () => {
    return filteredDocuments.reduce((sum, doc) => sum + doc.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Riwayat Dokumen</h1>
          <p className="text-muted-foreground">
            Kelola dan lihat semua dokumen yang telah dibuat.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Nilai</p>
          <p className="text-2xl font-bold">Rp {getTotalAmount().toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari klien atau nomor dokumen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Jenis Dokumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="quotation">Penawaran</SelectItem>
                  <SelectItem value="bast">BAST</SelectItem>
                  <SelectItem value="receipt">Kwitansi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Jatuh Tempo</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Dokumen ({filteredDocuments.length})</CardTitle>
          <CardDescription>
            Daftar semua dokumen yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Tidak ada dokumen ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah filter atau buat dokumen baru.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => {
                const TypeIcon = documentTypeIcons[doc.type];
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light">
                        <TypeIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{doc.number}</h4>
                          <Badge variant="outline">
                            {documentTypeLabels[doc.type]}
                          </Badge>
                          <Badge className={statusColors[doc.status]}>
                            {statusLabels[doc.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.client}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Dibuat: {new Date(doc.date).toLocaleDateString('id-ID')}</span>
                          {doc.dueDate && (
                            <span>Jatuh tempo: {new Date(doc.dueDate).toLocaleDateString('id-ID')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">Rp {doc.amount.toLocaleString('id-ID')}</p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}