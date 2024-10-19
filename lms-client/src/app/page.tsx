import Link from "next/link";

export default async function Page() {
  return (
    <div className=" w-full my-20 flex items-center justify-center">
      <div className=" flex flex-col items-center gap-3">
        <h1 className=" text-4xl font-semibold pb-6">
          Learning Management System
        </h1>
        <div className=" flex items-center gap-4">
          <Link
            href={"/creator"}
            className=" bg-white text-black px-4 py-2 rounded-lg shadow-sm"
          >
            Continue as creator
          </Link>
          <Link
            href={"/student"}
            className="bg-white text-black px-4 py-2 rounded-lg shadow-sm"
          >
            Continue as student
          </Link>
        </div>
      </div>
    </div>
  );
}
