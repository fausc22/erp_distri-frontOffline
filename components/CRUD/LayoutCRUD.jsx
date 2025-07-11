import Head from 'next/head';

export function LayoutCRUD({ title, descripcion, children }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | {title}</title>
        <meta name="description" content={descripcion} />
      </Head>
      
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}