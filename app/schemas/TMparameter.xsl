<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    exclude-result-prefixes="xs xd" version="1.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Jul 13, 2015</xd:p>
            <xd:p><xd:b>Author:</xd:b> jlouis</xd:p>
            <xd:p>Testing Stylesheet, the goal is to have a parameter conditioning the transform.</xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:param name="layer1"></xsl:param>
        
    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"><xsl:with-param name="layer1"/></xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="category[name!='Error modes']/group/gc/ga[name='Wrong identification']">
        <name>Wrong identification</name>
        <desc></desc>
        <tm>
            !!
            <p>Title: <xsl:value-of select="$layer1" /></p>
            !!
        </tm>
    </xsl:template>   
    
</xsl:stylesheet>