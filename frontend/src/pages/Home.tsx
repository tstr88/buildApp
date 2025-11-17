import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-concrete-light)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-charcoal)] mb-2">
                buildApp
              </h1>
              <p className="text-gray-600">საქართველოს სამშენებლო ბაზარი</p>
            </div>
            <button
              onClick={() => logout()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              გასვლა / Logout
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">მოგესალმებით! / Welcome!</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-[var(--color-action)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <p className="text-gray-600">{user?.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">ტიპი / Type</p>
                <p className="text-lg font-semibold capitalize">
                  {user?.user_type === 'buyer' ? 'მყიდველი / Buyer' : 'მიმწოდებელი / Supplier'}
                </p>
              </div>

              {user?.buyer_role && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">როლი / Role</p>
                  <p className="text-lg font-semibold capitalize">
                    {user.buyer_role === 'homeowner' ? 'მესაკუთრე / Homeowner' : 'კონტრაქტორი / Contractor'}
                  </p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">ენა / Language</p>
                <p className="text-lg font-semibold uppercase">{user?.language}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-xs font-mono">{user?.id}</p>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-8 p-6 bg-[var(--color-concrete-light)] rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">მალე მოვალთ! / Coming Soon!</h3>
            <p className="text-gray-600">
              პროდუქტების კატალოგი, RFQ სისტემა, შეკვეთები და მრავალი სხვა...
              <br />
              Product catalog, RFQ system, orders and more...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
