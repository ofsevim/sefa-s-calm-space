import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContentManagement() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">İçerik Yönetimi</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Sayfa İçerikleri</CardTitle>
                    <CardDescription>
                        Sayfa içeriklerini buradan yönetebilirsiniz.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        İçerik yönetimi özellikleri yakında eklenecek.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
