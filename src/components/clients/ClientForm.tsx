import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

export interface ClientFormData {
	company_name: string;
	client_name: string;
	address: string;
	phone: string;
	email: string;
}

interface Props {
	editingClient: any | null;
	formData: ClientFormData;
	setFormData: (v: ClientFormData) => void;
	onSave: () => void;
	onCancel: () => void;
}

export default function ClientForm({
	editingClient,
	formData,
	setFormData,
	onSave,
	onCancel,
}: Props) {
	return (
		<>
			<div className="space-y-4 py-4">
				<div>
					<Label htmlFor="company">Nama Perusahaan</Label>
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
					<Label htmlFor="client">Nama Klien</Label>
					<Input
						id="client"
						value={formData.client_name}
						onChange={(e) =>
							setFormData({
								...formData,
								client_name: e.target.value,
							})
						}
						placeholder="Pa/Ibu -"
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
							setFormData({ ...formData, phone: e.target.value })
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
							setFormData({ ...formData, email: e.target.value })
						}
						placeholder="contact@example.com"
					/>
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onClick={onCancel}>
					Batal
				</Button>
				<Button onClick={onSave}>
					{editingClient ? "Perbarui" : "Simpan"}
				</Button>
			</DialogFooter>
		</>
	);
}
