import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black text-gray-400 px-4 md:px-6 py-8 border-t border-gray-600">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <nav className="flex gap-4 sm:gap-6">
          {/* <Link className="hover:text-gray-200" href="#">
            Privacy
          </Link>
          <Link className="hover:text-gray-200" href="#">
            Terms
          </Link> */}
          <Link
            className="hover:text-gray-200"
            href="https://lucaschabiron.com"
          >
            Contact
          </Link>
        </nav>
        <p className="text-sm">© 2024 sifter. All rights reserved.</p>
      </div>
    </footer>
  );
}
