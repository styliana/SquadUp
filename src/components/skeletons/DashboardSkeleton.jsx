const DashboardSkeleton = ({ activeTab }) => {
  // Generujemy tablicę 3 elementów, żeby wyświetlić 3 skeletony
  const items = [1, 2, 3];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {items.map((i) => (
        <div key={i} className="bg-surface border border-white/5 rounded-2xl overflow-hidden animate-pulse">
          
          {/* Symulacja górnej części karty (Header) */}
          <div className="p-6 border-b border-white/5 flex justify-between items-start">
            <div className="w-full max-w-lg">
              {/* Tytuł */}
              <div className="h-8 w-3/4 bg-white/10 rounded-lg mb-3"></div>
              {/* Badge kategorii + status */}
              <div className="flex gap-2 mb-2">
                <div className="h-6 w-24 bg-white/5 rounded-md"></div>
                <div className="h-6 w-20 bg-white/5 rounded-md"></div>
              </div>
              {/* Daty i liczniki */}
              <div className="flex gap-4 mt-3">
                <div className="h-4 w-32 bg-white/5 rounded"></div>
                <div className="h-4 w-24 bg-white/5 rounded"></div>
              </div>
            </div>

            {/* Przyciski akcji (Eye, Edit, Trash) */}
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-white/5 rounded-lg"></div>
              <div className="h-10 w-10 bg-white/5 rounded-lg"></div>
              <div className="h-10 w-10 bg-white/5 rounded-lg"></div>
            </div>
          </div>

          {/* Symulacja dolnej części (Applications / Content) */}
          <div className="p-6 bg-background/50">
            {activeTab === 'published' ? (
              // Symulacja listy kandydatów
              <div className="space-y-3">
                 <div className="h-20 w-full bg-surface border border-white/5 rounded-xl"></div>
              </div>
            ) : (
              // Symulacja treści aplikacji (dla tabu 'Applied')
               <div className="h-16 w-full bg-white/5 rounded-xl"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardSkeleton;