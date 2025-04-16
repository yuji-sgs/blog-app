// src/app/news/page.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

// 記事の場所を指定
const postsDirectory = path.join(process.cwd(), "data/news");

// 投稿数
const PAGE_SIZE = 5;

// ページ数を計算する関数
const range = (start: number, end: number, length = end - start + 1) =>
  Array.from({ length }, (_, i) => start + i);

// 記事データの型定義
type PostData = {
  slug: string;
  title: string;
  date: string;
  isPublished?: boolean;
};

// 記事一覧データを取得する関数
async function getNewsData(page: number = 1) {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: PostData[] = fileNames
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, ""); // ファイル名から.mdを削除
      const fullPath = path.join(postsDirectory, fileName); // ファイルの場所を取得
      const fileContents = fs.readFileSync(fullPath, "utf-8"); // ファイルの内容を取得
      const matterResult = matter(fileContents); // ファイルの内容を解析
      return {
        slug, // ファイル名
        ...(matterResult.data as Omit<PostData, "slug">), // メタデータ
      };
    })
    .filter((post) => post.isPublished !== false); // 公開された記事のみ

  // 投稿を日付でソート
  const sortedPosts = allPostsData.sort((postA, postB) =>
    new Date(postA.date) > new Date(postB.date) ? -1 : 1
  );

  // ページネーション処理
  const pages = range(1, Math.ceil(allPostsData.length / PAGE_SIZE));
  const posts = sortedPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    posts,
    pages,
  };
}

const News = async ({ params }: { params: { page?: string } }) => {
  const currentPage = params.page ? parseInt(params.page) : 1;
  const { posts, pages } = await getNewsData(currentPage);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">News</h1>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug} className="border p-4 rounded-lg shadow hover:bg-gray-50 transition">
            <Link href={`/news/${post.slug}`}>
              <div>
                <h2 className="text-xl font-semibold text-blue-600">{post.title}</h2>
                <p className="text-sm text-gray-500">{post.date}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-2">Pages:</p>
        <ul className="flex justify-center space-x-2">
          {pages.map((page) => (
            <li key={page}>
              <Link
                href={`/news/page/${page}`}
                className="px-3 py-1 border rounded hover:bg-blue-100 hover:text-blue-700 transition"
              >
                {page}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>  
  );
};

export default News;