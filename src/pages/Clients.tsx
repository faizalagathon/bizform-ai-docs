import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search } from "lucide-react";
import ClientForm from "@/components/clients/ClientForm";
import ClientsSearch from "@/components/clients/ClientsSearch";
import ClientsTable from "@/components/clients/ClientsTable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Client {
	id: string;
	company_name: string;
	address: string;
	phone: string;
	email: string;
	createdAt: string;
}

export default function Clients() {
	const { toast } = useToast();
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0);
	const [pageSize] = useState(10);
	const [hasMore, setHasMore] = useState(true);
	const [totalCount, setTotalCount] = useState<number | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingClient, setEditingClient] = useState<Client | null>(null);
	const [formData, setFormData] = useState({
		company_name: "",
		address: "",
		phone: "",
		email: "",
	});

	// Data ditampilkan sesuai hasil query server-side
	const filteredClients = clients;

	const loadClients = async (reset: boolean = false) => {
		if (loading) return;
		setLoading(true);

		try {
			const currentPage = reset ? 0 : page;
			const from = currentPage * pageSize;
			const to = from + pageSize - 1;

			let query = supabase
				.from("clients")
				.select("id, company_name, address, phone, email, created_at", {
					count: "exact",
				})
				.order("created_at", { ascending: false })
				.range(from, to);

			if (searchTerm.trim()) {
				const term = `%${searchTerm.trim()}%`;
				query = query.or(
					`company_name.ilike.${term},email.ilike.${term}`
				);
			}

			const { data, error, count } = await query;
			if (error) throw error;

			const mapped: Client[] = (data ?? []).map((row: any) => ({
				id: String(row.id),
				company_name: row.company_name ?? "",
				address: row.address ?? "",
				phone: row.phone ?? "",
				email: row.email ?? "",
				createdAt: row.created_at ?? new Date().toISOString(),
			}));

			setClients((prev) => (reset ? mapped : [...prev, ...mapped]));
			setPage(currentPage + 1);
			if (typeof count === "number") {
				setTotalCount(count);
				const loaded = (reset ? 0 : clients.length) + mapped.length;
				setHasMore(loaded < count);
			} else {
				setHasMore(mapped.length === pageSize);
			}
		} catch (e: any) {
			toast({
				variant: "destructive",
				title: "Gagal memuat data",
				description:
					e?.message ??
					"Terjadi kesalahan saat mengambil data klien.",
			});
		} finally {
			setLoading(false);
		}
	};

	// Initial load
	useEffect(() => {
		// muat awal
		loadClients(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Refetch saat searchTerm berubah (debounce sederhana)
	useEffect(() => {
		const id = setTimeout(() => {
			setPage(0);
			setHasMore(true);
			loadClients(true);
		}, 400);
		return () => clearTimeout(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	const handleOpenDialog = (client?: Client) => {
		if (client) {
			setEditingClient(client);
			setFormData({
				company_name: client.company_name,
				address: client.address,
				phone: client.phone,
				email: client.email,
			});
		} else {
			setEditingClient(null);
			setFormData({
				company_name: "",
				address: "",
				phone: "",
				email: "",
			});
		}
		setIsDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsDialogOpen(false);
		setEditingClient(null);
		setFormData({
			company_name: "",
			address: "",
			phone: "",
			email: "",
		});
	};

	const handleSave = async () => {
		if (!formData.company_name) {
			toast({
				variant: "destructive",
				title: "Data Tidak Lengkap",
				description: "Nama perusahaan wajib diisi.",
			});
			return;
		}

		setLoading(true);

		try {
			if (editingClient) {
				// Update existing client

				const { data, error } = await supabase
					.from("clients")
					.update({
						company_name: formData.company_name,
						address: formData.address,
						phone: formData.phone,
						email: formData.email,
					})
					.eq("id", editingClient.id)
					.select()
					.single();

				if (error) throw error;

				// Update local state with returned row (if any)
				if (data) {
					setClients((prev) =>
						prev.map((client) =>
							client.id === editingClient.id
								? {
										id: String(data.id),
										company_name: data.company_name ?? "",
										address: data.address ?? "",
										phone: data.phone ?? "",
										email: data.email ?? "",
										createdAt:
											data.created_at ??
											new Date().toISOString(),
								  }
								: client
						)
					);
				}

				toast({
					title: "Klien Berhasil Diperbarui",
					description: `Data ${formData.company_name} telah diperbarui.`,
				});
			} else {
				// Insert new client to Supabase
				const { data, error } = await supabase
					.from("clients")
					.insert([
						{
							company_name: formData.company_name,
							address: formData.address,
							phone: formData.phone,
							email: formData.email,
						},
					])
					.select()
					.single();

				if (error) throw error;

				// Add new client
				const newClient: Client = {
					id: String(data.id),
					company_name: data.company_name ?? formData.company_name,
					address: data.address ?? formData.address,
					phone: data.phone ?? formData.phone,
					email: data.email ?? formData.email,
					createdAt: new Date().toISOString(),
				};
				setClients((prev) => [newClient, ...prev]);
				toast({
					title: "Klien Berhasil Ditambahkan",
					description: `${formData.company_name} telah ditambahkan ke daftar klien.`,
				});
			}

			handleCloseDialog();
		} catch (e: any) {
			toast({
				variant: "destructive",
				title: "Gagal menyimpan data",
				description:
					e?.message ??
					"Terjaddi kesalahan saat menyimpan data klien.",
			});
		} finally {
			setLoading(false);
		}
		handleCloseDialog();
	};

	const handleDelete = async (client: Client) => {
		const removedId = client.id;
		setClients((prev) => prev.filter((c) => c.id !== removedId));

		try {
			const { error } = await supabase
				.from("clients")
				.delete()
				.eq("id", removedId);
			if (error) throw error;

			toast({
				title: "Klien Berhasil Dihapus",
				description: `${client.company_name} telah dihapus dari daftar klien`,
			});
		} catch (e: any) {
			toast({
				variant: "destructive",
				title: "Gagal menghapus klien",
				description: e?.message ?? "Terjadi kesalahan saat menghapus data klien",
			});

			loadClients(true); // reload to restore
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Daftar Klien
					</h1>
					<p className="text-muted-foreground">
						Kelola data klien untuk kemudahan pembuatan dokumen.
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => handleOpenDialog()}>
							<Plus className="mr-2 h-4 w-4" />
							Tambah Klien
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								{editingClient
									? "Edit Klien"
									: "Tambah Klien Baru"}
							</DialogTitle>
							<DialogDescription>
								{editingClient
									? "Perbarui informasi klien"
									: "Masukkan informasi klien baru"}
							</DialogDescription>
						</DialogHeader>
						<ClientForm
							editingClient={editingClient}
							formData={formData}
							setFormData={(v) => setFormData(v)}
							onSave={handleSave}
							onCancel={handleCloseDialog}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search and Stats */}
			<ClientsSearch
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				totalCount={totalCount}
				clientsCount={clients.length}
			/>

			{/* Clients Table */}
			<Card>
				<CardHeader>
					<CardTitle>Daftar Klien</CardTitle>
					<CardDescription>
						{totalCount !== null
							? `${filteredClients.length} dari ${totalCount} klien`
							: `${filteredClients.length} klien`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ClientsTable
						clients={filteredClients}
						loading={loading}
						totalCount={totalCount}
						hasMore={hasMore}
						onLoadMore={() => loadClients()}
						onEdit={(c) => handleOpenDialog(c)}
						onDelete={(c) => handleDelete(c)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
