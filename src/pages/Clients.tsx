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
import { Plus, Edit, Trash2, Users, Search } from "lucide-react";
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
				query = query.or(`company_name.ilike.${term},email.ilike.${term}`);
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

	const handleSave = () => {
		if (!formData.company_name) {
			toast({
				variant: "destructive",
				title: "Data Tidak Lengkap",
				description: "Nama perusahaan wajib diisi.",
			});
			return;
		}

		if (editingClient) {
			// Update existing client
			setClients(
				clients.map((client) =>
					client.id === editingClient.id
						? { ...client, ...formData }
						: client
				)
			);
			toast({
				title: "Klien Berhasil Diperbarui",
				description: `Data ${formData.company_name} telah diperbarui.`,
			});
		} else {
			// Add new client
			const newClient: Client = {
				id: Date.now().toString(),
				...formData,
				createdAt: new Date().toISOString(),
			};
			setClients([...clients, newClient]);
			toast({
				title: "Klien Berhasil Ditambahkan",
				description: `${formData.company_name} telah ditambahkan ke daftar klien.`,
			});
		}

		handleCloseDialog();
	};

	const handleDelete = (client: Client) => {
		setClients(clients.filter((c) => c.id !== client.id));
		toast({
			title: "Klien Berhasil Dihapus",
			description: `${client.company_name} telah dihapus dari daftar klien.`,
		});
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
						<div className="space-y-4 py-4">
							<div>
								<Label htmlFor="company">
									Nama Perusahaan/Klien *
								</Label>
								<Input
									id="company"
									value={formData.company_name}
									onChange={(e) =>
										setFormData({
											...formData,
											company_name: e.target.value,
										})
									}
									placeholder="PT Contoh Perusahaan"
								/>
							</div>
							<div>
								<Label htmlFor="address">Alamat</Label>
								<Textarea
									id="address"
									value={formData.address}
									onChange={(e) =>
										setFormData({
											...formData,
											address: e.target.value,
										})
									}
									placeholder="Jl. Contoh No. 123, Jakarta"
									rows={3}
								/>
							</div>
							<div>
								<Label htmlFor="phone">No. Telepon</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) =>
										setFormData({
											...formData,
											phone: e.target.value,
										})
									}
									placeholder="021-1234567"
								/>
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({
											...formData,
											email: e.target.value,
										})
									}
									placeholder="contact@example.com"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={handleCloseDialog}
							>
								Batal
							</Button>
							<Button onClick={handleSave}>
								{editingClient ? "Perbarui" : "Simpan"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search and Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="md:col-span-3">
					<CardContent className="p-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Cari klien berdasarkan nama atau email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Users className="h-8 w-8 text-primary" />
							<div>
								<p className="text-2xl font-bold">
									{clients.length}
								</p>
								<p className="text-xs text-muted-foreground">
									Total Klien
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

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
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Perusahaan</TableHead>
								<TableHead>Kontak</TableHead>
								<TableHead>Alamat</TableHead>
								<TableHead>Dibuat</TableHead>
								<TableHead className="text-right">
									Aksi
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredClients.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-8"
									>
										<div className="text-muted-foreground">
											{loading
												? "Memuat..."
												: searchTerm
												? "Tidak ada klien yang ditemukan"
												: "Belum ada klien"}
										</div>
									</TableCell>
								</TableRow>
							) : (
								filteredClients.map((client) => (
									<TableRow key={client.id}>
										<TableCell>
											<div>
												<p className="font-medium">
													{client.company_name}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<p className="text-sm">
													{client.phone}
												</p>
												<p className="text-sm text-muted-foreground">
													{client.email}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<p className="text-sm text-muted-foreground max-w-xs truncate">
												{client.address}
											</p>
										</TableCell>
										<TableCell>
											<p className="text-sm">
												{new Date(
													client.createdAt
												).toLocaleDateString("id-ID")}
											</p>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end space-x-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleOpenDialog(client)
													}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="sm"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Hapus Klien?
															</AlertDialogTitle>
															<AlertDialogDescription>
																Yakin ingin
																menghapus{" "}
																{client.company_name}
																? Tindakan ini
																tidak dapat
																dibatalkan.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																Batal
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDelete(
																		client
																	)
																}
																className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
															>
																Hapus
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
					<div className="mt-4 flex justify-center">
						{hasMore && (
							<Button
								onClick={() => loadClients()}
								disabled={loading}
								variant="outline"
							>
								{loading ? "Memuat..." : "Muat lebih banyak"}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
