/**
 * Renders HTML content from a blog post with professional typography styling.
 * The content is stored as HTML (with h2, h3, p, ul, ol, li, strong, etc.)
 * and we style it via a wrapper with Tailwind prose-like classes.
 */
export function PostContent({ html }: { html: string }) {
  return (
    <div
      className="post-content
        text-[15px] leading-relaxed text-slate-700 sm:text-base sm:leading-[1.8]
        [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-[#00455e] [&_h2]:scroll-mt-20
        [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#212121]
        [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-[#212121]
        [&_p]:mb-4 [&_p]:leading-relaxed
        [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5
        [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5
        [&_li]:leading-relaxed [&_li]:text-slate-600
        [&_li>ul]:mt-1.5 [&_li>ul]:mb-0 [&_li>ul]:space-y-1
        [&_strong]:font-bold [&_strong]:text-[#212121]
        [&_a]:font-semibold [&_a]:text-[#00455e] [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:text-[#faae0b]
        [&_blockquote]:border-l-4 [&_blockquote]:border-[#faae0b] [&_blockquote]:bg-slate-50 [&_blockquote]:py-3 [&_blockquote]:pl-4 [&_blockquote]:pr-4 [&_blockquote]:text-sm [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:rounded-r-lg [&_blockquote]:my-6
        [&_img]:my-6 [&_img]:rounded-xl [&_img]:shadow-md
        [&_hr]:my-8 [&_hr]:border-slate-200
        [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse
        [&_th]:border [&_th]:border-slate-300 [&_th]:bg-[#00455e] [&_th]:p-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-bold [&_th]:text-white
        [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_td]:text-sm
        [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono [&_code]:text-[#00455e]
        [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-sm
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100
        first:[&_h2]:mt-0
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
