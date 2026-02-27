  import React, { useEffect } from 'react';
  import { Bell, Search, User } from 'lucide-react';
  import { useAuth } from '../../contexts/AuthContext';
  import { getMessaging, getToken, onMessage } from 'firebase/messaging';
  import { initializeApp } from 'firebase/app';


  // Firebase config - SAME as in Service Worker
  const firebaseConfig = {
    apiKey: "AIzaSyDdLCmaf81v8K5GTAKsUNW3NdqvuisAwwI",
    authDomain: "ardevelopment.firebaseapp.com",
    projectId: "ardevelopment",
    storageBucket: "ardevelopment.firebasestorage.app",
    messagingSenderId: "727238251429",
    appId: "1:727238251429:web:a2f2ffbcd046774a3f0e4c",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  const Header: React.FC = () => {
    const { user }:any = useAuth();
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [notifOpen, setNotifOpen] = React.useState(false);
    const [loadingNotif, setLoadingNotif] = React.useState(false);

    const fetchNotifications = async () => {
      try {
        setLoadingNotif(true);

        const res = await fetch(
          "https://api.itfixer199.com/api/notifications/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        console.log("🔔 Notifications API:", data);

        setNotifications(data?.notifications);

      } catch (error) {
        console.error("Notification fetch error:", error);
      } finally {
        setLoadingNotif(false);
      }
    };

    const fetchLatestData = async () => {
      try {
        const res = await fetch("/api/your-updated-api/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        console.log("🔥 Refreshed Data:", data);

        // 👉 here update your state
        // setOrders(data)
        // setNotifications(data)

      } catch (error) {
        console.error("API refresh error:", error);
      }
    };

    useEffect(() => {
      const setupFCM = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("Permission denied");
            return;
          }

          // 1️⃣ Register Service Worker
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );

          console.log("✅ SW Registered:", registration);

          // 2️⃣ Wait until Service Worker becomes active
          await navigator.serviceWorker.ready;
          console.log("✅ SW Ready");

          // 3️⃣ Now get token
          const token = await getToken(messaging, {
            vapidKey:
              "BBx3Da6ZgNI-WGrY8NBTLWwMeSalHROn8K0DABNop80fcwIk8aXRxtP_kx2_NtmgY3VRyH8Obyz3osUWhNQiwrQ",
            serviceWorkerRegistration: registration,
          });

          console.log("🔥 FCM TOKEN:", token);

          if (token) {
            await fetch("https://api.itfixer199.com/api/notifications/register-fcm/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ fcm_token: token }),
            });

            console.log("✅ Token sent to backend");
          }
        } catch (err) {
          console.error("❌ FCM Setup Error:", err);
        }
      };
      console.log("🔥 Header mounted - FCM initializing");
      setupFCM();

      // 🔥 THIS IS THE IMPORTANT PART
      // const unsubscribe = onMessage(messaging, async (payload) => {

      //   console.log("📩 Firebase Message Received:", payload);

      //   const newNotif = {
      //     id: payload.messageId || Date.now(),
      //     title: payload.notification?.title || "New Update",
      //     body: payload.notification?.body || "Data updated",
      //     time: new Date().toLocaleTimeString(),
      //   };

      //   // 🔥 Add to notification list (top la add aagum)
      //   setNotifications((prev) => [newNotif, ...prev]);

      //   // 🔥 Browser popup
      //   new Notification(newNotif.title, {
      //     body: newNotif.body,
      //     icon: "/default-icon.png",
      //   });

      //   await fetchLatestData();
      // });

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("📩 Firebase Message Received:", payload);

        const title =
          payload.notification?.title || "New Notification";

        const body =
          payload.notification?.body || "You have a new message";

        const notification = new Notification(title, {
          body: body,
          icon: "/default-icon.png",
        });

        // 🔥 Auto close after 4 seconds
        setTimeout(() => {
          notification.close();
        }, 4000);
      });

      return () => unsubscribe();
    }, []);

    return (
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders, customers, agents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button> */}

          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                fetchNotifications(); // 🔥 API call here
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto z-50">

                {loadingNotif ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading...
                  </div>
                ) : notifications?.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications?.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!notif.is_read ? "bg-gray-100" : ""
                        }`}
                    >
                      <div className="font-semibold text-sm">
                        {notif.title}
                      </div>

                      <div className="text-xs text-gray-600">
                        {notif.body}
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}

              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900 capitalize">
                {user?.name} 
              </div>
              <div className="text-gray-500 capitalize">{user?.role?.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>
      </header>
    );
  };

  export default Header;