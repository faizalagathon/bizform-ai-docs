import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";

interface Client {
	id: string;
	company_name: string;
	address: string;
	phone: string;
	email: string;
	createdAt: string;
}

interface Props {
	clients: Client[];
	loading: boolean;
	totalCount: number | null;
	hasMore: boolean;
	onLoadMore: () => void;
	onEdit: (c: Client) => void;
	onDelete: (c: Client) => void;
}

export default function ClientsTable({
	clients,
	loading,
	totalCount,
	hasMore,
	onLoadMore,
	onEdit,
	onDelete,
}: Props) {
	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Perusahaan</TableHead>
						<TableHead>Kontak</TableHead>
						<TableHead>Alamat</TableHead>
						<TableHead>Dibuat</TableHead>
						<TableHead className="text-right">Aksi</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{clients.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center py-8">
								<div className="text-muted-foreground">
									{loading ? "Memuat..." : "Belum ada klien"}
								</div>
							</TableCell>
						</TableRow>
					) : (
						clients.map((client) => (
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
											onClick={() => onEdit(client)}
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
														Yakin ingin menghapus{" "}
														{client.company_name}?
														Tindakan ini tidak dapat
														dibatalkan.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Batal
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															onDelete(client)
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
						onClick={onLoadMore}
						disabled={loading}
						variant="outline"
					>
						{loading ? "Memuat..." : "Muat lebih banyak"}
					</Button>
				)}
			</div>
		</>
	);
}
