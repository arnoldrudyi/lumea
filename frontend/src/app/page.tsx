import { Header, Container, Hero, Features, Faq, Footer } from "@/components/shared";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Container className="mt-32 mt-[13vh] xl:mt-[25vh] max-w-[1000px] xl:max-w-[1200px]">
          <Hero />
        </Container>
        <Container className="mt-32 md:mt-64 max-w-[1000px] xl:max-w-[1200px]">
          <Features />
        </Container>
        <Container className="mt-32 md:mt-64 max-w-[1000px] xl:max-w-[1200px]">
          <Faq />
        </Container>
      </main>
      <Footer className="relative" />
    </>
  );
}
