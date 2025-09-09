import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface Props {
	searchTerm: string;
	setSearchTerm: (v: string) => void;
	totalCount: number | null;
	clientsCount: number;
}

export default function ClientsSearch({
	searchTerm,
	setSearchTerm,
	clientsCount,
}: Props) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card className="md:col-span-3">
				<CardContent className="p-4">
					<div className="relative">
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
							<p className="text-2xl font-bold">{clientsCount}</p>
							<p className="text-xs text-muted-foreground">
								Total Klien
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
