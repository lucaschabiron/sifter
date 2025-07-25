"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { usePathname } from "next/navigation";
import React from "react";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  let breadcrumb: BreadcrumbItem[] = [];
  if (pathname === "/dashboard") {
    breadcrumb = [{ name: "Dashboard" }];
  } else if (pathname === "/sifts") {
    breadcrumb = [{ name: "Dashboard", href: "/dashboard" }, { name: "Sifts" }];
  } else if (pathname === "/sifts/create") {
    breadcrumb = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Sifts", href: "/sifts" },
      { name: "Create Sift" },
    ];
  } else if (pathname.startsWith("/sifts/") && pathname.endsWith("/edit")) {
    breadcrumb = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Sifts", href: "/sifts" },
      { name: "Edit Sift" },
    ];
  } else if (pathname.startsWith("/sifts/")) {
    breadcrumb = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Sifts", href: "/sifts" },
      { name: "Sift Details" },
    ];
  } else if (pathname === "/newsletters") {
    breadcrumb = [{ name: "Dashboard", href: "/dashboard" }, { name: "Newsletters" }];
  } else if (pathname.startsWith("/newsletters/")) {
    breadcrumb = [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Newsletters", href: "/newsletters" },
      { name: "Newsletter Details" }
    ];
  } else if (pathname === "/beta") {
    breadcrumb = [{ name: "Dashboard", href: "/dashboard" }, { name: "Beta" }];
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumb.map((item, index) => {
          return (
            <React.Fragment key={index}>
              {index !== 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
