import { prisma } from "@/app/lib/prisma";
import { Button } from "@/components/ui/button";
import { createCategory, toggleCategory } from "@/actions/categories";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage resource categories.</p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          const name = String(formData.get("name") || "");
          await createCategory(name);
        }}
        className="flex items-center gap-2"
      >
        <input
          name="name"
          placeholder="New category"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          required
        />
        <Button type="submit">Add Category</Button>
      </form>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      category.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleCategory.bind(null, category.id, !category.isActive)}>
                    <Button variant="outline" size="sm" type="submit">
                      {category.isActive ? "Disable" : "Enable"}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
