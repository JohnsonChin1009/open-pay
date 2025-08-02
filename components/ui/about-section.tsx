export function AboutSection() {
  const features = [
    {
      title: "Relational Blockchain",
      description:
        "The first blockchain platform to use relational databases, making it easier to build complex applications.",
    },
    {
      title: "Developer Friendly",
      description: "Write smart contracts in familiar languages and use SQL for data queries.",
    },
    {
      title: "Scalable Architecture",
      description: "Built for high-performance applications with enterprise-grade scalability.",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl text-black mb-6">About Openpay</h2>
          <p className="text-xl text-black/70 max-w-3xl mx-auto">
            Openpay is a relational blockchain platform that makes it easy to build decentralized applications with the
            power and flexibility of traditional databases.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <h3 className="font-headline text-2xl text-black mb-4">{feature.title}</h3>
              <p className="text-black/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
