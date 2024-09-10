import React from "react";

import { LogoLight } from "@/components/svgs";
import { Container, Title } from "@/components/shared";

export default function ErrorPage() {
  return (
    <main>
      <a href="/">
        <LogoLight className="absolute right-0 left-0 mx-auto top-8" />
      </a>
      <Container className="flex flex-col space-y-6 items-center justify-center h-screen w-full max-w-[410px]">
        <div className="flex flex-col items-center space-y-5 text-center">
          <Title size="sm" text="Nothing found." className="font-bold" />
          <p className="text-muted-foreground">Looks like this page has gone AWOL. Head back to the <a href="/" className="underline">homepage</a> and try searching for what you need.</p>
        </div> 
      </Container>
    </main>
  )
}