import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ban, Shield } from "lucide-react";

interface BanListProps {
  banPhone: string;
  setBanPhone: (val: string) => void;
  banReason: string;
  setBanReason: (val: string) => void;
  banUser: () => void;
  bannedUsers: any[];
  unbanUser: (id: string) => void;
}

export const BanList = ({
  banPhone,
  setBanPhone,
  banReason,
  setBanReason,
  banUser,
  bannedUsers,
  unbanUser
}: BanListProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-500" /> Kullanıcı Engelle
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Telefon Numarası</Label>
              <Input placeholder="05XX XXX XXXX" value={banPhone} onChange={e => setBanPhone(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Engelleme Sebebi</Label>
              <Input placeholder="No-show, kötüye kullanım vb." value={banReason} onChange={e => setBanReason(e.target.value)} className="bg-muted/50 border-border h-11 rounded-xl" />
            </div>
          </div>
          <Button onClick={banUser} className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-rose-600/20">
            <Ban className="w-4 h-4 mr-2" /> KARA LİSTEYE EKLE
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {bannedUsers.length === 0 ? (
          <div className="text-center py-16 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
            <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Kara listede kimse yok.</p>
          </div>
        ) : bannedUsers.map((bu: any) => (
          <div key={bu.id} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-rose-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Ban className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{bu.phone}</p>
                <p className="text-[10px] text-muted-foreground">{bu.reason} • {new Date(bu.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => unbanUser(bu.id)} className="rounded-xl font-bold border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5">ENGEL KALDIR</Button>
          </div>
        ))}
      </div>
    </div>
  );
};
