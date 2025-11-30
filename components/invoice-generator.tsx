import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 5,
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 3,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    padding: 5,
  },
  total: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

interface InvoiceData {
  id: string;
  workOrderId: string;
  workOrder: {
    id: string;
    deviceType: string;
    issueDescription: string;
    status: string;
    createdAt: string;
    device?: {
      manufacturer: string;
      model: string;
    };
  };
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    phone?: string;
  };
}

interface InvoiceGeneratorProps {
  invoice: InvoiceData;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text style={styles.companyInfo}>
          ServiXing - Professional Device Repair Services
        </Text>
        <Text style={styles.companyInfo}>Lagos, Nigeria</Text>
        <Text style={styles.companyInfo}>
          Phone: +234 XXX XXX XXXX | Email: support@servixing.com
        </Text>
      </View>

      <View style={styles.invoiceDetails}>
        <View>
          <Text style={styles.sectionTitle}>Invoice Number:</Text>
          <Text style={styles.text}>{invoice.id.slice(-8).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Date:</Text>
          <Text style={styles.text}>
            {new Date(invoice.createdAt).toLocaleDateString("en-NG")}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text style={styles.text}>
          {invoice.user.name || invoice.user.email || "Customer"}
        </Text>
        {invoice.user.email && (
          <Text style={styles.text}>{invoice.user.email}</Text>
        )}
        {invoice.user.phone && (
          <Text style={styles.text}>{invoice.user.phone}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Order Details:</Text>
        <Text style={styles.text}>
          Work Order ID: {invoice.workOrder.id.slice(-8)}
        </Text>
        <Text style={styles.text}>
          Device: {invoice.workOrder.deviceType} -{" "}
          {invoice.workOrder.device?.manufacturer}{" "}
          {invoice.workOrder.device?.model}
        </Text>
        <Text style={styles.text}>
          Issue: {invoice.workOrder.issueDescription}
        </Text>
        <Text style={styles.text}>
          Status: {invoice.workOrder.status.replace("_", " ")}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Description</Text>
          <Text style={styles.tableCell}>Quantity</Text>
          <Text style={styles.tableCell}>Unit Price</Text>
          <Text style={styles.tableCell}>Total</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Device Repair Service</Text>
          <Text style={styles.tableCell}>1</Text>
          <Text style={styles.tableCell}>
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: invoice.currency,
            }).format(invoice.amount)}
          </Text>
          <Text style={styles.tableCell}>
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: invoice.currency,
            }).format(invoice.amount)}
          </Text>
        </View>
      </View>

      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>
          {new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: invoice.currency,
          }).format(invoice.amount)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>
          Thank you for choosing ServiXing. Payment is due within 30 days.
        </Text>
        <Text>This is a computer-generated invoice.</Text>
      </View>
    </Page>
  </Document>
);

export const generateInvoicePDF = async (invoice: InvoiceData) => {
  const blob = await pdf(<InvoiceGenerator invoice={invoice} />).toBlob();
  return blob;
};

export default InvoiceGenerator;
