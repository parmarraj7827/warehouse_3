import { useMutation, UPDATE_PROFILE } from "../../services/backend";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Camera, Save } from "lucide-react";

export default function Profile() {
  // Get our user context, including the function to manually update the context's data!
  const { user, updateUser } = useAuth();

  // Set the initial form inputs to whatever the user currently has
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [image, setImage] = useState(user?.profileImage || "");

  // Setup the tool to push data to the backend
  const [save, { loading, error }] = useMutation(UPDATE_PROFILE);

  // What happens when they click "Update Profile"?
  const submit = async (e) => {
    e.preventDefault();

    try {
      // 1. Send the changes to the database
      const { data } = await save({
        variables: { input: { name, phone, profileImage: image } },
      });

      // 2. If it succeeded, update our local AuthContext so the changes 
      // appear immediately in the Navbar/Sidebar without reloading the page!
      if (data?.updateProfile) {
        updateUser(data.updateProfile);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  // What happens when they click the camera to upload a file?
  const handleImageChange = (e) => {
    // Grab the actual file from their computer
    const file = e.target.files?.[0];
    if (!file) return;

    // FileReader is a built-in browser tool that reads files as strings
    const reader = new FileReader();

    // Tell the reader: When you finish reading, put the string into our 'image' variable
    reader.onload = () => {
      setImage(reader.result);
    };

    // Tell the reader: Start reading!
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="mt-1 muted">View and update your profile information</p>
      </div>

      <form onSubmit={submit} className="card overflow-hidden">
        <div className="grid md:grid-cols-[250px_1fr]">
          
          {/* ========================================== */}
          {/* LEFT COLUMN: AVATAR IMAGE UPLOADER         */}
          {/* ========================================== */}
          <div className="flex flex-col items-center justify-center border-b border-slate-100 p-7 md:border-b-0 md:border-r">
            <div className="relative">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-blue-100 text-4xl font-bold text-blue-700">
                {image ? (
                  <img src={image} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  name.slice(0, 1).toUpperCase()
                )}
              </div>

              {/* The actual file input is hidden! We style its <label> to look like a button */}
              <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-blue-600 p-2 text-white shadow">
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden" // Hides the ugly default "Choose File" button
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <h2 className="mt-4 text-lg font-bold">{name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {user?.role === "admin" ? "Administrator" : "Warehouse Staff"}
            </p>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: TEXT INPUTS                  */}
          {/* ========================================== */}
          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                {/* Email is disabled because we don't want them to change their login email */}
                <input
                  type="email"
                  className="input bg-slate-50"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Role</label>
                {/* Role is disabled because only Admins can change roles */}
                <input
                  type="text"
                  className="input bg-slate-50 capitalize"
                  value={user?.role || ""}
                  disabled
                />
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

            <div className="mt-7 flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Updating..." : "Update Profile"}
                <Save size={16} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
