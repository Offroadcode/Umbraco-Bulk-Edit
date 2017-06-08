using System;
using System.Web;
using System.Web.Caching;
using System.Xml;
using Umbraco.Core.Logging;

namespace UmbracoBulkEdit.Lookups
{
    public abstract class BaseLookup<T>
    {

        internal abstract string Filename { get; }
        internal abstract T Convert(XmlDocument doc);
        private static object lockObj = new object();

        public void ClearLookup()
        {
            HttpContext.Current.Cache.Remove(Filename);
        }

        public T GetAll()
        {
            return GetData();
        }

        private string GetCacheKey()
        {
            return "Lookup_" + Filename;
        }

        internal T GetData()
        {
            var ctx = HttpContext.Current;
            var raw = ctx.Cache.Get(GetCacheKey());
            T lookup;
            if (raw == null)
            {
                lock (lockObj)
                {
                    raw = ctx.Cache.Get(GetCacheKey());
                    if (raw == null)
                    {
                        var lookupDoc = new XmlDocument();

                        try
                        {
                            var path = HttpContext.Current.Server.MapPath(Filename);

                            lookupDoc.Load(path);
                            lookup = this.Convert(lookupDoc);

                            ctx.Cache.Add(
                                Filename,
                                lookup,
                                new CacheDependency(path),
                                Cache.NoAbsoluteExpiration,
                                Cache.NoSlidingExpiration,
                                CacheItemPriority.Default,
                                null);
                        }
                        catch (Exception ex)
                        {
                            LogHelper.Error<string>("Unable to load " + Filename, ex);
                            throw;
                        }
                    }
                    else
                    {
                        lookup = (T)raw;
                    }
                }
            }
            else
            {
                lookup = (T)raw;
            }
            return lookup;
        }
    }
}
