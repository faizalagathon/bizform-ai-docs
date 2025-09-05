import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Clock, Plus, FileBarChart2, Receipt, FileCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Dokumen",
    value: "248",
    description: "Dokumen telah dibuat",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary-light",
  },
  {
    title: "Bulan Ini",
    value: "42",
    description: "+12% dari bulan lalu",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-green-50",
  },
  {
    title: "Pending",
    value: "8",
    description: "Menunggu pembayaran",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-yellow-50",
  },
];

const quickActions = [
  {
    title: "Invoice",
    description: "Buat tagihan untuk klien",
    icon: Receipt,
    color: "bg-blue-500",
    link: "/create?type=invoice",
  },
  {
    title: "Penawaran",
    description: "Buat proposal penawaran",
    icon: FileBarChart2,
    color: "bg-green-500",
    link: "/create?type=quotation",
  },
  {
    title: "BAST",
    description: "Berita acara serah terima",
    icon: FileCheck,
    color: "bg-purple-500",
    link: "/create?type=bast",
  },
  {
    title: "Kwitansi",
    description: "Tanda terima pembayaran",
    icon: Users,
    color: "bg-orange-500",
    link: "/create?type=receipt",
  },
];

const recentDocuments = [
  {
    id: "INV-2024-001",
    type: "Invoice",
    client: "PT Maju Jaya",
    date: "2024-01-15",
    amount: "Rp 15.000.000",
    status: "Paid",
  },
  {
    id: "QUO-2024-001",
    type: "Quotation",
    client: "CV Sukses Mandiri",
    date: "2024-01-14",
    amount: "Rp 8.500.000",
    status: "Pending",
  },
  {
    id: "BAST-2024-001",
    type: "BAST",
    client: "PT Teknologi Nusantara",
    date: "2024-01-13",
    amount: "Rp 12.000.000",
    status: "Completed",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali! Kelola dokumen bisnis Anda dengan mudah.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary-hover">
          <Link to="/create">
            <Plus className="mr-2 h-4 w-4" />
            Buat Dokumen
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Pilih jenis dokumen yang ingin Anda buat
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-4 hover:shadow-md transition-all"
                asChild
              >
                <Link to={action.link}>
                  <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dokumen Terbaru</CardTitle>
              <CardDescription>
                Dokumen yang baru saja dibuat
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/history">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{doc.id}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">{doc.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.client}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{doc.amount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'Paid' ? 'bg-success text-success-foreground' :
                      doc.status === 'Pending' ? 'bg-warning text-warning-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}