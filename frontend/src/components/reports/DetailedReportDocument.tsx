import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { VibrationRecord, Machine } from '@/entities/all';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: 'grey',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1px solid #EEEEEE',
    paddingBottom: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryBox: {
    width: '30%',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 10,
    color: 'grey',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    backgroundColor: '#f2f2f2',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: 'grey',
    fontSize: 10,
  },
});

interface DetailedReportDocumentProps {
  records: (VibrationRecord & { machine_id: string })[];
  machines: Machine[];
}

const DetailedReportDocument: React.FC<DetailedReportDocumentProps> = ({ records, machines }) => {
  const getMachineName = (machineId: string) => {
    return machines.find(m => m.id === machineId)?.name || 'Unknown';
  };

  const avgRMS = (records.reduce((sum, r) => sum + (r.rms_value || 0), 0) / records.length || 0).toFixed(4);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Vibration Analysis Detailed Report</Text>
          <Text style={styles.subtitle}>Generated on: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{records.length}</Text>
              <Text style={styles.summaryLabel}>Total Records</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{new Set(records.map(r => r.machine_id)).size}</Text>
              <Text style={styles.summaryLabel}>Machines Monitored</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{avgRMS}</Text>
              <Text style={styles.summaryLabel}>Average RMS</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Records</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Date</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Machine</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>File Name</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>RMS Value</Text></View>
            </View>
            {records.map(record => (
              <View key={record.id} style={styles.tableRow}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{new Date(record.created_date).toLocaleDateString()}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{getMachineName(record.machine_id)}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{record.file_name}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{record.rms_value?.toFixed(4) || 'N/A'}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer} fixed>VibraSense - Confidential Report</Text>
      </Page>
    </Document>
  );
};

export default DetailedReportDocument;