// ==========================================
// DATA TABLE COMPONENT
// A highly reusable component for displaying rows and columns of data.
// ==========================================
export default function DataTable({
  columns,  // Array of column definitions: [{ key: 'name', label: 'Full Name' }, ...]
  rows,     // Array of data objects: [{ id: 1, name: 'John' }, ...]
  loading,  // Boolean: Are we currently fetching the data?
  empty = "No records found.", // String: What to show if there is no data
  rowKey = (r, i) => r.id || r._id || i, // Function to get a unique key for each row
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          
          {/* 1. TABLE HEADER (The column titles) */}
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              {/* Loop through our columns array and create a <th> for each */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-4 py-3 font-semibold"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* 2. TABLE BODY (The actual data rows) */}
          <tbody className="divide-y divide-slate-100">
            
            {/* Condition A: We are loading data */}
            {loading ? (
              <tr>
                {/* colSpan makes this cell stretch across all columns */}
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-500">
                  Loading...
                </td>
              </tr>
              
            // Condition B: We finished loading, but there is no data
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                  {empty}
                </td>
              </tr>
              
            // Condition C: We have data! Map through the rows.
            ) : (
              rows.map((row, index) => (
                <tr key={rowKey(row, index)} className="hover:bg-slate-50/70">
                  
                  {/* For each row, map through the columns again to put the right data in the right cell */}
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-3.5 text-slate-700">
                      {/* If the column has a custom 'render' function, use it! Otherwise, just show the raw text. */}
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  
                </tr>
              ))
            )}
          </tbody>
          
        </table>
      </div>
    </div>
  );
}
