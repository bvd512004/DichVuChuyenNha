// =============================================
// SCRIPT DEBUG ĐỂ KIỂM TRA TOKEN VÀ PHÂN QUYỀN
// =============================================

// Mở Developer Tools (F12) và chạy script này trong Console

function debugToken() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.log("❌ Không có token trong localStorage");
    return;
  }
  
  try {
    // Decode JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("❌ Token không đúng định dạng JWT");
      return;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    console.log("🔍 THÔNG TIN TOKEN:");
    console.log("📋 Full payload:", payload);
    console.log("👤 Username:", payload.sub);
    console.log("🆔 User ID:", payload.userId);
    console.log("👥 Roles:", payload.roles);
    console.log("💼 Position:", payload.position);
    console.log("⏰ Issued at:", new Date(payload.iat * 1000));
    console.log("⏰ Expires at:", new Date(payload.exp * 1000));
    
    // Kiểm tra role
    const roles = payload.roles || [];
    console.log("\n🔐 KIỂM TRA PHÂN QUYỀN:");
    console.log("✅ Roles trong token:", roles);
    console.log("✅ Có phải MANAGER?", roles.includes("MANAGER"));
    console.log("✅ Có phải ADMIN?", roles.includes("ADMIN"));
    
    // Kiểm tra localStorage
    console.log("\n💾 THÔNG TIN LOCALSTORAGE:");
    console.log("🔑 Token:", token ? "Có" : "Không");
    console.log("👤 Username:", localStorage.getItem("username"));
    console.log("🆔 User ID:", localStorage.getItem("userId"));
    console.log("👥 Role ID:", localStorage.getItem("roleId"));
    console.log("👥 Role Name:", localStorage.getItem("roleName"));
    console.log("💼 Position:", localStorage.getItem("position"));
    
    // Test phân quyền vehicle-assignment
    console.log("\n🚗 KIỂM TRA PHÂN QUYỀN VEHICLE-ASSIGNMENT:");
    const allowedRoles = ["admin", "manager"];
    const normalizedRoles = roles.map(role => role.toLowerCase());
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    console.log("📝 Allowed roles:", allowedRoles);
    console.log("📝 Normalized allowed roles:", normalizedAllowedRoles);
    console.log("📝 Normalized token roles:", normalizedRoles);
    
    const hasRolePermission = normalizedRoles.some(role => normalizedAllowedRoles.includes(role));
    console.log("✅ Có quyền truy cập vehicle-assignment?", hasRolePermission);
    
    if (hasRolePermission) {
      console.log("🎉 BẠN CÓ QUYỀN TRUY CẬP VEHICLE-ASSIGNMENT!");
    } else {
      console.log("❌ BẠN KHÔNG CÓ QUYỀN TRUY CẬP VEHICLE-ASSIGNMENT!");
      console.log("💡 Kiểm tra lại role trong database và token");
    }
    
  } catch (error) {
    console.log("❌ Lỗi khi decode token:", error);
  }
}

// Chạy debug
debugToken();

// =============================================
// HƯỚNG DẪN SỬ DỤNG:
// =============================================
/*
1. Mở trang web và đăng nhập với tài khoản manager
2. Mở Developer Tools (F12)
3. Vào tab Console
4. Copy và paste script này vào Console
5. Nhấn Enter để chạy
6. Xem kết quả debug để tìm nguyên nhân
*/
