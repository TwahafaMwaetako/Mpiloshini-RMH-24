import React, { useEffect, useState } from 'react';
import { Machine, VibrationRecord } from '@/entities/all';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import NeumorphicButton from '@/components/NeumorphicButton';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DetailedReportDocument from './DetailedReportDocument';
import { Download, Loader2 } from 'lucide-react';

interface ReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  records: (VibrationRecord & { machine_id: string })[];
  machines: Machine[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ open, onClose, records, machines }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-soft-light-gray">
        <DialogHeader>
          <DialogTitle>Generate Detailed Report</DialogTitle>
          <DialogDescription>
            A detailed PDF report will be generated based on your current filters.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-text-body">
            The report will include <span className="font-semibold">{records.length}</span> records from <span className="font-semibold">{new Set(records.map(r => r.machine_id)).size}</span> unique machines.
          </p>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <NeumorphicButton onClick={onClose} variant="secondary">Close</NeumorphicButton>
          {isClient && (
            <PDFDownloadLink
              document={<DetailedReportDocument records={records} machines={machines} />}
              fileName={`vibrasense-report-${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <NeumorphicButton disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </NeumorphicButton>
              )}
            </PDFDownloadLink>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportGenerator;