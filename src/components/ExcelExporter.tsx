import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";

interface ExportData {
  transactions?: any[];
  budgets?: any[];
  goals?: any[];
  maaser?: any[];
  accounts?: any[];
}

interface ExcelExporterProps {
  data: ExportData;
  filename?: string;
}

export default function ExcelExporter({ data, filename }: ExcelExporterProps) {
  const { toast } = useToast();

  const exportToExcel = async () => {
    try {
      // Import xlsx library dynamically
      const XLSX = await import('xlsx');

      // Create new workbook
      const wb = XLSX.utils.book_new();

      // Add Transactions sheet
      if (data.transactions && data.transactions.length > 0) {
        const transWs = XLSX.utils.json_to_sheet(
          data.transactions.map((t) => ({
            'תאריך': format(new Date(t.transaction_date), 'dd/MM/yyyy'),
            'תיאור': t.description || '',
            'קטגוריה': t.category_name || '',
            'סכום': t.amount,
            'סוג': t.type === 'income' ? 'הכנסה' : 'הוצאה',
            'סוחר': t.merchant_name || '',
            'הערות': t.notes || '',
          }))
        );
        XLSX.utils.book_append_sheet(wb, transWs, 'תנועות');
      }

      // Add Budgets sheet
      if (data.budgets && data.budgets.length > 0) {
        const budgetWs = XLSX.utils.json_to_sheet(
          data.budgets.map((b) => ({
            'קטגוריה': b.category_name || '',
            'תקציב': b.amount,
            'הוצא': b.spent || 0,
            'יתרה': b.amount - (b.spent || 0),
            'אחוז ניצול': Math.round(((b.spent || 0) / b.amount) * 100) + '%',
            'תקופה': b.period === 'monthly' ? 'חודשי' : 'שנתי',
          }))
        );
        XLSX.utils.book_append_sheet(wb, budgetWs, 'תקציבים');
      }

      // Add Goals sheet
      if (data.goals && data.goals.length > 0) {
        const goalsWs = XLSX.utils.json_to_sheet(
          data.goals.map((g) => ({
            'שם היעד': g.name,
            'סכום יעד': g.target_amount,
            'סכום נוכחי': g.current_amount || 0,
            'יתרה': g.target_amount - (g.current_amount || 0),
            'אחוז השלמה': Math.round(((g.current_amount || 0) / g.target_amount) * 100) + '%',
            'תאריך יעד': g.target_date ? format(new Date(g.target_date), 'dd/MM/yyyy') : '',
          }))
        );
        XLSX.utils.book_append_sheet(wb, goalsWs, 'יעדים');
      }

      // Add Maaser sheet
      if (data.maaser && data.maaser.length > 0) {
        const maaserWs = XLSX.utils.json_to_sheet(
          data.maaser.map((m) => ({
            'תקופה': `${format(new Date(m.period_start), 'dd/MM/yyyy')} - ${format(new Date(m.period_end), 'dd/MM/yyyy')}`,
            'הכנסות': m.total_income,
            'מעשר (10%)': m.maaser_amount,
            'שולם': m.maaser_paid || 0,
            'יתרה': m.maaser_balance,
          }))
        );
        XLSX.utils.book_append_sheet(wb, maaserWs, 'מעשרות');
      }

      // Add Accounts sheet
      if (data.accounts && data.accounts.length > 0) {
        const accountsWs = XLSX.utils.json_to_sheet(
          data.accounts.map((a) => ({
            'שם החשבון': a.name,
            'בנק': a.bank_name || '',
            'יתרה': a.balance,
            'מטבע': a.currency || 'ILS',
            'סטטוס': a.is_active ? 'פעיל' : 'לא פעיל',
          }))
        );
        XLSX.utils.book_append_sheet(wb, accountsWs, 'חשבונות');
      }

      // Generate filename
      const date = format(new Date(), 'yyyy-MM-dd');
      const fileName = filename || `דוח_פיננסי_${date}.xlsx`;

      // Write file
      XLSX.writeFile(wb, fileName);

      toast({
        title: "✅ הקובץ יוצא בהצלחה!",
        description: `הקובץ ${fileName} הורד למחשב`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "שגיאה בייצוא",
        description: "לא הצלחנו לייצא את הנתונים. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={exportToExcel} variant="outline" className="gap-2">
      <FileSpreadsheet className="w-4 h-4" />
      ייצוא ל-Excel
    </Button>
  );
}

// Also export a simple CSV version
export function CSVExporter({ data, filename }: { data: any[]; filename?: string }) {
  const { toast } = useToast();

  const exportToCSV = () => {
    try {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map((row) => headers.map((h) => JSON.stringify(row[h] || '')).join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `export_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "✅ הקובץ יוצא בהצלחה!",
        description: "קובץ CSV הורד למחשב",
      });
    } catch (error) {
      toast({
        title: "שגיאה בייצוא",
        description: "לא הצלחנו לייצא את הנתונים.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={exportToCSV} variant="outline" className="gap-2">
      <Download className="w-4 h-4" />
      ייצוא ל-CSV
    </Button>
  );
}
