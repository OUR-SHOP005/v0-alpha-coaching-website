import { createServerSupabaseClient } from '@/lib/supabase'

export default async function ServerSideComponent() {
    // Create a Supabase client for server-side usage
    const supabase = createServerSupabaseClient()

    // Fetch courses directly from the server component
    const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching courses:', error)
        return <div>Error loading courses</div>
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Server Component with Supabase</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 shadow-sm">
                        <h2 className="text-xl font-semibold">{course.title}</h2>
                        <p className="text-gray-600 mt-2">{course.description}</p>
                        <div className="mt-4 flex justify-between">
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {course.duration}
                            </span>
                            <span className="font-medium">₹{course.fee}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 