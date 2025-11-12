import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  message,
  Spin,
  Button,
} from "antd";
import axiosInstance from "../service/axiosInstance";
import pdfMake from "pdfmake/build/pdfmake";
import PdfFontsProvider from "../ultils/pdfFonts";

const { Title } = Typography;

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/invoices/me");
      setInvoices(response.data || []);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      message.error("Không thể tải danh sách hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Định dạng tiền tệ
  const formatMoney = (amount) =>
    amount?.toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " VNĐ";

  // Map loại hóa đơn
  const getTypeLabel = (type) => {
    const map = {
      DEPOSIT: { label: "Tạm ứng", color: "blue" },
      PAYMENT: { label: "Thanh toán", color: "green" },
      INVOICE: { label: "Hóa đơn", color: "purple" },
      REFUND: { label: "Hoàn tiền", color: "red" },
    };
    return map[type] || { label: type, color: "default" };
  };

  // Tạo PDF chi tiết
  const generatePDF = (record) => {
    // Tạo danh sách dịch vụ
    const serviceRows =
      record.services && record.services.length > 0
        ? record.services.map((s, index) => [
            {
              text: `${index + 1}. ${s.serviceName} - ${s.priceType}`,
              margin: [0, 2, 0, 2],
            },
            { text: s.quantity || 1, alignment: "center" },
            {
              text: formatMoney(s.subtotal / (s.quantity || 1)),
              alignment: "right",
            },
            { text: formatMoney(s.subtotal), alignment: "right" },
          ])
        : [
            [
              { text: "Không có dịch vụ nào", colSpan: 4, alignment: "center" },
              {},
              {},
              {},
            ],
          ];

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 80],
      header: {
        columns: [
          { image: "logo", width: 70, margin: [40, 20, 0, 0] },
          {
            stack: [
              { text: "CÔNG TY TNHH DỊCH VỤ CHUYỂN NHÀ", style: "company" },
              { text: "Mã số thuế: 0312345678", style: "sub" },
              { text: "123 Đường ABC, Q.1, TP.HCM", style: "sub" },
              { text: "Hotline: (028) 1234 5678", style: "sub" },
            ],
            alignment: "right",
            margin: [0, 25, 40, 0],
          },
        ],
      },
      content: [
        { text: "HÓA ĐƠN DỊCH VỤ", style: "title", alignment: "center", margin: [0, 20] },

        // Thông tin khách hàng
        {
          table: {
            widths: ["25%", "75%"],
            body: [
              [{ text: "Khách hàng", style: "label" }, record.username || "—"],
              [{ text: "Email", style: "label" }, record.email || "—"],
              [{ text: "Điện thoại", style: "label" }, record.phone || "—"],
              [{ text: "Mã số thuế", style: "label" }, record.vatNumber || "—"],
            ],
          },
          layout: "lightHorizontalLines",
          margin: [40, 10, 40, 20],
        },

        // Danh sách dịch vụ + tổng + tạm ứng
        {
          table: {
            headerRows: 1,
            widths: ["*", "10%", "25%", "25%"],
            body: [
              // Header
              [
                { text: "Dịch vụ", style: "tableHeader" },
                { text: "SL", style: "tableHeader", alignment: "center" },
                { text: "Đơn giá", style: "tableHeader", alignment: "right" },
                { text: "Thành tiền", style: "tableHeader", alignment: "right" },
              ],
              ...serviceRows,

              // TỔNG CỘNG
              [
                { text: "TỔNG CỘNG", bold: true, colSpan: 3, alignment: "right" },
                {}, {},
                { text: formatMoney(record.totalAmount), bold: true, alignment: "right", color: "#d4380d" },
              ],

              // ĐÃ TẠM ỨNG (chỉ hiện nếu có)
              ...(record.depositAmount > 0
                ? [
                    [
                      { text: "Đã thanh toán đặt cọc trước đó", bold: true, colSpan: 3, alignment: "right" },
                      {}, {},
                      { text: formatMoney(record.depositAmount), bold: true, alignment: "right", color: "#52c41a" },
                    ],
                  ]
                : []),
            ],
          },
          layout: {
            hLineColor: () => "#ddd",
            vLineColor: () => "#ddd",
          },
          margin: [40, 0, 40, 30],
        },

        // Chữ ký
        {
          columns: [
            { width: "50%", text: "" },
            {
              width: "50%",
              stack: [
                { text: "Ngày ... / ... / ...", alignment: "center" },
                {
                  text: "Người lập hóa đơn",
                  bold: true,
                  alignment: "center",
                  margin: [0, 10],
                },
                {
                  text: "(Ký, ghi rõ họ tên)",
                  fontSize: 10,
                  italics: true,
                  alignment: "center",
                },
              ],
            },
          ],
          margin: [40, 20],
        },
        {
          text: "Cảm ơn Quý khách đã sử dụng dịch vụ!",
          style: "footer",
          alignment: "center",
          margin: [0, 30],
        },
      ],
      footer: (currentPage, pageCount) => ({
        text: `Trang ${currentPage}/${pageCount}`,
        alignment: "center",
        fontSize: 9,
        color: "#999",
        margin: [0, 10],
      }),
      images: {
        logo:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      },
      defaultStyle: { font: "Roboto" },
      styles: {
        title: { fontSize: 20, bold: true, color: "#d4380d" },
        company: { fontSize: 13, bold: true, color: "#d4380d" },
        sub: { fontSize: 10, color: "#555" },
        label: { bold: true, fontSize: 11 },
        tableHeader: { fillColor: "#f5f5f5", bold: true, fontSize: 11 },
        footer: { fontSize: 10, italics: true, color: "#777" },
      },
    };

    try {
      pdfMake
        .createPdf(docDefinition)
        .download(`HoaDon_${record.contractId || record.paymentId || "NA"}.pdf`);
      message.success("Đã tạo hóa đơn PDF!");
    } catch (err) {
      console.error("Lỗi PDF:", err);
      message.error("Lỗi khi tạo PDF!");
    }
  };

  // Cấu hình bảng danh sách hóa đơn
  const columns = [
    {
      title: "Mã tham chiếu",
      key: "referenceId",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.contractId && <Tag color="orange">HD#{record.contractId}</Tag>}
          {record.paymentId && <Tag color="geekblue">TT#{record.paymentId}</Tag>}
        </Space>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <b>{record.username || "—"}</b>
          <div>{record.email || "—"}</div>
          <div>{record.phone || "—"}</div>
        </Space>
      ),
    },
    {
      title: "Mã số thuế",
      dataIndex: "vatNumber",
      key: "vatNumber",
      render: (vat) => (vat ? <Tag color="gold">{vat}</Tag> : "—"),
    },
    {
      title: "Loại hóa đơn",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const info = getTypeLabel(type);
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "Số tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount) => (
        <b style={{ color: "#d4380d" }}>{formatMoney(amount)}</b>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => generatePDF(record)}>
          Tải PDF
        </Button>
      ),
    },
  ];

  return (
    <>
      <PdfFontsProvider />
      <Card
        style={{
          margin: 24,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ padding: "4px 0 16px" }}>
          <Title level={3} style={{ margin: 0 }}>
            Danh sách hóa đơn
          </Title>
          <Typography.Text type="secondary">
            Quản lý hóa đơn tạm ứng, thanh toán và dịch vụ kèm theo
          </Typography.Text>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" tip="Đang tải hóa đơn..." />
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
            <Title level={5}>Chưa có hóa đơn nào</Title>
            <Typography.Text type="secondary">
              Các hóa đơn sẽ xuất hiện khi bạn thực hiện giao dịch.
            </Typography.Text>
          </div>
        ) : (
          <Table
            dataSource={invoices}
            columns={columns}
            rowKey={(record) =>
              `${record.contractId || ""}-${record.paymentId || ""}`
            }
            pagination={{
              pageSize: 8,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trong ${total} hóa đơn`,
            }}
          />
        )}
      </Card>
    </>
  );
};

export default InvoiceList;