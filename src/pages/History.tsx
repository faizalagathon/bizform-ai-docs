import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Eye, Download, Edit, Trash2, Filter, FileText, Receipt, FileBarChart2, FileCheck, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  document_number: string;
  document_type: "invoice" | "quotation" | "bast" | "receipt";
  client_name: string;
  company_name: string;
  date: string;
  due_date?: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  notes?: string;
  created_at: string;
}

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
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Load documents from Supabase
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('documents')
        .select(`
          id,
          document_number,
          document_type,
          date,
          due_date,
          total_amount,
          subtotal,
          tax_amount,
          discount_amount,
          notes,
          created_at,
          clients (
            company_name,
            client_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to match interface
      const transformedData: Document[] = (data || []).map((doc: any) => ({
        id: doc.id,
        document_number: doc.document_number,
        document_type: doc.document_type,
        client_name: doc.clients?.client_name || doc.clients?.company_name || 'Unknown Client',
        company_name: doc.clients?.company_name || 'Unknown Company',
        date: doc.date,
        due_date: doc.due_date,
        total_amount: parseFloat(doc.total_amount) || 0,
        subtotal: parseFloat(doc.subtotal) || 0,
        tax_amount: parseFloat(doc.tax_amount) || 0,
        discount_amount: parseFloat(doc.discount_amount) || 0,
        notes: doc.notes,
        created_at: doc.created_at,
      }));
      
      setDocuments(transformedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal memuat dokumen",
        description: error.message || "Terjadi kesalahan saat mengambil data dokumen.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete document
  const handleDelete = async (documentId: string) => {
    try {
      // Delete document items first
      const { error: itemsError } = await (supabase as any)
        .from('document_items')
        .delete()
        .eq('document_id', documentId);

      if (itemsError) throw itemsError;

      // Delete document
      const { error: docError } = await (supabase as any)
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (docError) throw docError;

      toast({
        title: "Dokumen Berhasil Dihapus",
        description: "Dokumen telah dihapus dari sistem.",
      });

      // Reload documents
      loadDocuments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Menghapus Dokumen",
        description: error.message || "Terjadi kesalahan saat menghapus dokumen.",
      });
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.document_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || doc.document_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getTotalAmount = () => {
    return filteredDocuments.reduce((sum, doc) => sum + doc.total_amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Memuat dokumen...</span>
      </div>
    );
  }

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
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Nilai</p>
            <p className="text-2xl font-bold">Rp {getTotalAmount().toLocaleString('id-ID')}</p>
          </div>
          <Button onClick={() => navigate('/create')} className="bg-primary hover:bg-primary-hover">
            <Plus className="mr-2 h-4 w-4" />
            Buat Dokumen
          </Button>
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
          <div className="grid gap-4 md:grid-cols-3">
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
              <h3 className="mt-4 text-lg font-medium">
                {documents.length === 0 ? "Belum ada dokumen" : "Tidak ada dokumen ditemukan"}
              </h3>
              <p className="text-muted-foreground">
                {documents.length === 0 
                  ? "Mulai dengan membuat dokumen pertama Anda." 
                  : "Coba ubah filter atau kata kunci pencarian."
                }
              </p>
              {documents.length === 0 && (
                <Button 
                  onClick={() => navigate('/create')} 
                  className="mt-4 bg-primary hover:bg-primary-hover"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Dokumen Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => {
                const TypeIcon = documentTypeIcons[doc.document_type];
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light">
                        <TypeIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{doc.document_number}</h4>
                          <Badge variant="outline">
                            {documentTypeLabels[doc.document_type]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.company_name}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Dibuat: {new Date(doc.date).toLocaleDateString('id-ID')}</span>
                          {doc.due_date && (
                            <span>Jatuh tempo: {new Date(doc.due_date).toLocaleDateString('id-ID')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">Rp {doc.total_amount.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground">
                          Subtotal: Rp {doc.subtotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/document/${doc.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/create?edit=${doc.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus dokumen {doc.document_number}? 
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(doc.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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