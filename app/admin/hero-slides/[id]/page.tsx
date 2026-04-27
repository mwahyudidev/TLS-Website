import { notFound } from "next/navigation";
import { getHeroSlide } from "@/server/modules/hero-slides/service";
import { AppError } from "@/server/lib/errors";
import { HeroSlideEditForm } from "./HeroSlideEditForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let slide;
  try {
    slide = await getHeroSlide(Number(id));
  } catch (e) {
    if (e instanceof AppError && e.code === "NOT_FOUND") notFound();
    throw e;
  }

  return (
    <div>
      <PageHeader
        title="Edit Hero Slide"
        back={{ label: "Hero Slides", href: "/admin/hero-slides" }}
      />
      <HeroSlideEditForm slide={slide} />
    </div>
  );
}
