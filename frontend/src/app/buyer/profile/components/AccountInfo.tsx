import { Calendar } from "lucide-react";

interface AccountInfoProps {
  user: {
    id: string;
    createdAt: string;
  };
}

export default function AccountInfo({ user }: AccountInfoProps) {
  // Safely format the date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-yogreet-purple" />
          Account Information
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-500 mb-1">
              Member Since
            </label>
            <p className="text-stone-900">{formatDate(user.createdAt)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-500 mb-1">
              Account ID
            </label>
            <p className="text-stone-900 font-mono text-sm">
              {user.id || "Unknown"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-500 mb-1">
              Account Type
            </label>
            <p className="text-stone-900">Buyer Account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-500 mb-1">
              Status
            </label>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
