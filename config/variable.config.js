module.exports.pathAdmin = "admin"

module.exports.permissionList = [
  {
    label: "Xem trang tổng quan",
    value: "dashboard-view"
  },
  {
    label: "Xem danh mục",
    value: "category-view"
  },
  {
    label: "Tạo danh mục",
    value: "category-create"
  },
  {
    label: "Sửa danh mục",
    value: "category-edit"
  },
  {
    label: "Xóa danh mục",
    value: "category-delete"
  },
  {
    label: "Thùng rác danh mục",
    value: "category-trash"
  },
  {
    label: "Xem tour",
    value: "tour-view"
  },
  {
    label: "Tạo tour",
    value: "tour-create"
  },
  {
    label: "Sửa tour",
    value: "tour-edit"
  },
  {
    label: "Xóa tour",
    value: "tour-delete"
  },
  {
    label: "Thùng rác tour",
    value: "tour-trash"
  },
  {
    label: "Xem đơn hàng",
    value: "order-view"
  },
  {
    label: "Sửa đơn hàng",
    value: "order-edit"
  },
  // {
  //   label: "Xem người dùng",
  //   value: "user-view"
  // },
  {
    label: "Xem thông tin liên hệ",
    value: "contact-view"
  },
  {
    label: "Chỉnh sửa thông tin liên hệ",
    value: "contact-edit"
  },
  {
    label: "Xem cài đặt chung",
    value: "setting-view"
  }
];

module.exports.paymentMethodList = [
  {
    label: "Tiền mặt",
    value: "money"
  },
  {
    label: "Chuyển khoản ngân hàng",
    value: "bank"
  },
  {
    label: "Ví Momo",
    value: "momo"
  },
  {
    label: "ZaloPay",
    value: "zalopay"
  },
  {
    label: "VNPay",
    value: "vnpay"
  }
]

module.exports.paymentStatusList = [
  {
    label: "Chưa thanh toán",
    value: "unpaid"
  },
  {
    label: "Đã thanh toán",
    value: "paid"
  }
]

module.exports.statusList = [
  {
    label: "Khởi tạo",
    value: "initial",
    color: "orange"
  },
  {
    label: "Hoàn thành",
    value: "done",
    color: "green"
  },
  {
    label: "Đã hủy",
    value: "cancel",
    color: "red"
  }
]