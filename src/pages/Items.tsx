import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  order_item_name: string;
  order_item_type: string;
  order_item_price: number;
  created_at: string;
}

export default function Items() {
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [formData, setFormData] = useState({
    order_item_name: "",
    order_item_type: "",
    order_item_price: 0,
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('order_item')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setItems((data as any) || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal memuat data item",
        description: error.message || "Terjadi kesalahan saat mengambil data item.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setFormData({
      order_item_name: "",
      order_item_type: "",
      order_item_price: 0,
    });
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!formData.order_item_name.trim()) {
      toast({
        variant: "destructive",
        title: "Nama item harus diisi",
        description: "Mohon lengkapi nama item.",
      });
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const { data, error } = await (supabase as any)
          .from('order_item')
          .update({
            order_item_name: formData.order_item_name,
            order_item_type: formData.order_item_type,
            order_item_price: formData.order_item_price,
          } as any)
          .eq('id', editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setItems(items.map(item => 
          item.id === editingItem.id ? (data as any) : item
        ));

        toast({
          title: "Item berhasil diupdate",
          description: `Item ${formData.order_item_name} telah diperbarui.`,
        });
      } else {
        // Create new item
        const { data, error } = await (supabase as any)
          .from('order_item')
          .insert([{
            order_item_name: formData.order_item_name,
            order_item_type: formData.order_item_type,
            order_item_price: formData.order_item_price,
          } as any])
          .select()
          .single();

        if (error) throw error;

        setItems([(data as any), ...items]);

        toast({
          title: "Item berhasil ditambahkan",
          description: `Item ${formData.order_item_name} telah ditambahkan.`,
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan item",
        description: error.message || "Terjadi kesalahan saat menyimpan item.",
      });
    }
  };

  const handleEdit = (item: OrderItem) => {
    setEditingItem(item);
    setFormData({
      order_item_name: item.order_item_name,
      order_item_type: item.order_item_type || "",
      order_item_price: item.order_item_price,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: OrderItem) => {
    if (!confirm(`Yakin ingin menghapus item "${item.order_item_name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('order_item' as any)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setItems(items.filter(i => i.id !== item.id));

      toast({
        title: "Item berhasil dihapus",
        description: `Item ${item.order_item_name} telah dihapus.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal menghapus item",
        description: error.message || "Terjadi kesalahan saat menghapus item.",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Daftar Item</h1>
          <p className="text-muted-foreground">
            Kelola daftar barang dan jasa untuk digunakan dalam dokumen.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Item" : "Tambah Item Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingItem 
                  ? "Perbarui informasi item yang sudah ada."
                  : "Tambahkan item barang atau jasa baru ke daftar."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="item_name">Nama Item</Label>
                <Input
                  id="item_name"
                  value={formData.order_item_name}
                  onChange={(e) => setFormData({...formData, order_item_name: e.target.value})}
                  placeholder="Contoh: Konsultasi IT, Server Setup, dll"
                />
              </div>
              <div>
                <Label htmlFor="item_type">Jenis Item (Opsional)</Label>
                <Input
                  id="item_type"
                  value={formData.order_item_type}
                  onChange={(e) => setFormData({...formData, order_item_type: e.target.value})}
                  placeholder="Contoh: Jasa, Barang, Konsultasi, dll"
                />
              </div>
              <div>
                <Label htmlFor="item_price">Harga</Label>
                <Input
                  id="item_price"
                  type="number"
                  min="0"
                  value={formData.order_item_price}
                  onChange={(e) => setFormData({...formData, order_item_price: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleSave}>
                  {editingItem ? "Update" : "Simpan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Table */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Daftar Item
          </CardTitle>
          <CardDescription>
            Daftar semua barang dan jasa yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Memuat data item...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada item yang ditambahkan.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Klik tombol "Tambah Item" untuk menambah item pertama.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Item</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.order_item_name}
                    </TableCell>
                    <TableCell>
                      {item.order_item_type ? (
                        <Badge variant="outline">{item.order_item_type}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.order_item_price)}
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}