import { CreateCourse } from "@/components/create-course";
import { BASE_URL } from "@/utils";
import axios from "axios";
import Link from "next/link";

export default async function Page() {
  const { data, status } = await axios.get(`${BASE_URL}/courses`, {
    // @ts-ignore
    next: {
      revalidate: 0,
    },
  });
  const courses = data as any[];

  return (
    <div className=" w-full flex h-full items-center justify-center pb-20">
      <div className=" flex flex-col items-center gap-3">
        <h1 className=" text-3xl font-semibold">Creator Dashboard</h1>
        <CreateCourse />

        <div>
          <h2 className=" text-2xl font-medium py-6">Your courses</h2>
          <div className=" grid grid-cols-2 gap-5 max-w-5xl mx-auto">
            {courses.map((c) => (
              <Link
                href={`/course/${c.id}`}
                className=" rounded-md border border-white hover:scale-[1.03] transition-all shadow-sm"
              >
                <img
                  src={`${BASE_URL}/${c.parts[0].thumbnail}`}
                  className=" w-full rounded-md"
                />
                <p className=" text-2xl pt-3 text-center">Course: {c.id}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
