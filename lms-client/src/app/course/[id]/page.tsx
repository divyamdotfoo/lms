import { CoursePlayer } from "@/components/course-player";
import { BASE_URL, formatTime } from "@/utils";
import axios from "axios";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const courseId = params.id;
  try {
    const { data, status } = await axios.get(`${BASE_URL}/course/${courseId}`);
    const parts = data.parts as any[];
    return (
      <div className=" w-fit mx-auto my-10">
        <p className=" text-4xl font-semibold pb-4 text-center">
          Course Id: {data.id}
        </p>
        <div className="flex items-start gap-10 justify-center">
          <CoursePlayer parts={parts} />
          <div className=" flex flex-col items-start gap-6 translate-y-6 max-h-[450px] overflow-y-scroll px-6">
            {parts.map((p) => (
              <Link
                key={p.id}
                href={`/course/${courseId}?v=${p.id}`}
                className=" flex items-center border shadow-sm gap-6 pr-6 bg-white text-black rounded-xl"
              >
                <img
                  src={`${BASE_URL}/${p.thumbnail}`}
                  className=" rounded-l-xl"
                  width={300}
                  height={"auto"}
                />
                <p>{p.name}</p>
                <p>{formatTime(p.duration.toFixed(2))}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
