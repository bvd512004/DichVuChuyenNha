// Debug token để xem role trong token
function debugToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found in localStorage");
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("=== TOKEN DEBUG ===");
    console.log("Token:", token);
    console.log("Payload:", payload);
    console.log("Roles:", payload.roles);
    console.log("Position:", payload.position);
    console.log("Username:", payload.sub);
    console.log("Expiration:", new Date(payload.exp * 1000));
    console.log("==================");
    
    return payload;
  } catch (err) {
    console.error("Error parsing token:", err);
  }
}

// Chạy khi load trang
debugToken();

